import { InternalAuth } from "@/modules/auth/auth.dto";
import { InternalUser } from "@/modules/user/user.dto";
import "express";

declare global {
  namespace Express {
    interface Request {
      id?: string;
      auth?: InternalAuth;
      user?: InternalUser;
      session: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        expiresAt: Date;
        token: string;
        ipAddress?: string;
        userAgent?: string;
        impersonatedBy?: string;
      }
    }
  }
}
