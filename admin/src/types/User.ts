import { College } from "./College";

export interface User {
  id: string;
  username: string;
  branch: string;
  college: string | College;
  isBlocked: boolean;
  suspension: {
    ends: string | Date | null;
    reason: string | null;
    howManyTimes: number;
  } | null;
  createdAt?: string | Date;
}
