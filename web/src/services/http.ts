import { env } from "@/config/env";
import axios from "axios";

export const http = axios.create({
  baseURL: env.NEXT_PUBLIC_SERVER_API_ENDPOINT,
  withCredentials: true,
});

http.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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
          if (original.headers) {
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
        const refreshResponse = await http.post("/auth/refresh");
        const newAccessToken = refreshResponse.data.accessToken;

        if (original.headers) {
          original.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        if (onRefreshSuccess) {
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
