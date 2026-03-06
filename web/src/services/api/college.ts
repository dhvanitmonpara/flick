import { AxiosResponse } from "axios";
import { http } from "../http";

export interface Branch {
  id: string;
  name: string;
  code: string;
}

export const collegeApi = {
  getCollegeBranches: async (collegeId: string): Promise<Branch[]> => {
    const response: AxiosResponse<{ branches: Branch[] }> = await http.get(`/colleges/${collegeId}/branches`);
    return response.data.branches;
  },
};
