import type { ApiResponse } from "./api";

declare module "axios" {
  export interface AxiosInstance {
    get<T = any, R = ApiResponse<T>>(url: string, config?: any): Promise<R>;
    post<T = any, R = ApiResponse<T>>(
      url: string,
      data?: any,
      config?: any
    ): Promise<R>;
    put<T = any, R = ApiResponse<T>>(
      url: string,
      data?: any,
      config?: any
    ): Promise<R>;
    delete<T = any, R = ApiResponse<T>>(url: string, config?: any): Promise<R>;
  }
}
