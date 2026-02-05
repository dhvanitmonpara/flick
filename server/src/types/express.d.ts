import { User } from "@/shared/types/User";
import "express";

declare global {
  namespace Express {
    interface Request {
      id?: string;
      user?: User;
    }
  }
}
