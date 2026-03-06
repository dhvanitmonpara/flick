import { env } from "@/config/env";
import axios, { type AxiosInstance } from "axios";
import type { ApiResponse, BackendEnvelope } from "@/types/api";

const stripTrailingSlash = (value: string) => value.replace(/\/+$/, "");
const stripAdminSuffix = (value: string) => value.replace(/\/admin$/, "");

const adminApiBase = stripTrailingSlash(env.apiUrl);
const rootApiBase = stripAdminSuffix(adminApiBase);

export const http = axios.create({
  baseURL: adminApiBase,
  withCredentials: true,
});

export const rootHttp = axios.create({
  baseURL: rootApiBase,
  withCredentials: true,
});

const withAccessToken = (client: AxiosInstance) => {
  client.interceptors.request.use(
    (config) => {
      const token = getAccessToken();
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
};

const withEnvelopeNormalizer = (client: AxiosInstance) => {
  client.interceptors.response.use(
    (response) => {
      const body = response.data as BackendEnvelope<unknown>;

      const normalized: ApiResponse<unknown> = {
        success: body.success,
        message: body.message,
        errors: body.errors,
        meta: body.meta,
        data: body.data,

        status: response.status,
        statusText: response.statusText,
        config: response.config,
        headers: response.headers,
        request: response.request,
      };

      return normalized;
    },
    (error) => Promise.reject(error)
  );
};

let getAccessToken: () => string | null = () => null;

export function setAccessTokenGetter(getter: () => string | null) {
  getAccessToken = getter;
}

let onRefreshSuccess: ((accessToken: string) => void) | null = null;
let onRefreshFailure: (() => void) | null = null;

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

export function setAuthCallbacks(
  onSuccess: (accessToken: string) => void,
  onFailure: () => void
) {
  onRefreshSuccess = onSuccess;
  onRefreshFailure = onFailure;
}

withAccessToken(http);
withAccessToken(rootHttp);

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        // If we're already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          if (token && original.headers) {
            original.headers.Authorization = `Bearer ${token}`;
          }
          return http(original);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await rootHttp.post("/auth/refresh");
        const newAccessToken = (refreshResponse.data as { accessToken?: string } | undefined)?.accessToken ?? null;

        if (newAccessToken && original.headers) {
          original.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        if (newAccessToken && onRefreshSuccess) {
          onRefreshSuccess(newAccessToken);
        }

        processQueue(null, newAccessToken);

        return http(original);
      } catch (refreshError) {
        processQueue(refreshError, null);

        if (onRefreshFailure) {
          onRefreshFailure();
        }

        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

withEnvelopeNormalizer(http);
withEnvelopeNormalizer(rootHttp);
