import {
  adminClient,
  inferAdditionalFields,
  oneTapClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { env } from "@/config/env";

export const authClient = createAuthClient({
  baseURL: `${env.NEXT_PUBLIC_SERVER_URI || "http://localhost:8000"}/api/auth`,
  plugins: [
    adminClient(),
    inferAdditionalFields(),
    oneTapClient({
      clientId: env.NEXT_PUBLIC_GOOGLE_OAUTH_ID,
      uxMode: "popup", // Can be "popup" or "redirect"
    }),
  ],
});
