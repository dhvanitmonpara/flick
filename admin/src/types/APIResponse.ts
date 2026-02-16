/* eslint-disable @typescript-eslint/no-explicit-any */
export type APIResponse = {
  success: boolean;
  data: any[];
  pagination: {
    page: number;
    limit: number;
    totalReports: number;
  };
  filters?: {
    statuses: string[];
  };
  message?: string;
};
