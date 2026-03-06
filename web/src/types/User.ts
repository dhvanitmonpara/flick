import { College } from "./College";

export interface User {
  id: string;
  username: string;
  branch: string;
  college: string | College | null;
  collegeId?: string | null;
  karma?: number;
  createdAt?: string;
  updatedAt?: string;
}
