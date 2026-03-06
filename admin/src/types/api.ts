import type { AxiosResponse } from "axios";

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  errors: any;
  meta: any;

  // Actual payload
  data: T;
} & AxiosResponse;

export type BackendEnvelope<T> = {
  success: boolean;
  message: string;
  errors: any;
  meta: any;
  data: T;
};
