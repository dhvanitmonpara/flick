import { AxiosResponse } from "axios";
import { http } from "../http";

export interface Branch {
  id: string;
  name: string;
  code: string;
}

export interface CollegeRequestInput {
  name: string;
  emailDomain: string;
  city: string;
  state: string;
  requestedByEmail: string;
}

export const collegeApi = {
  getById: async (collegeId: string) => {
    const response = await http.get(`/colleges/${collegeId}`);
    return response;
  },
  getCollegeBranches: async (collegeId: string): Promise<Branch[]> => {
    const response: AxiosResponse<{ branches: Branch[] }> = await http.get(
      `/colleges/${collegeId}/branches`,
    );
    return response.data.branches;
  },
  requestCollege: async (payload: CollegeRequestInput) => {
    const response: AxiosResponse<{ request: { id: string } }> = await http.post(
      "/colleges/requests",
      payload,
    );
    return response.data.request;
  },
};
