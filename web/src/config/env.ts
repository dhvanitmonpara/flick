import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production", "test"]),
    SERVER_URI: z.url(),
  },

  client: {
    NEXT_PUBLIC_SERVER_API_ENDPOINT: z.url(),
    NEXT_PUBLIC_OCR_SERVER_API_ENDPOINT: z.url(),
    NEXT_PUBLIC_BASE_URL: z.url(),
    NEXT_PUBLIC_GOOGLE_OAUTH_ID: z.string().min(10),
  },

  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    SERVER_URI: process.env.SERVER_URI,

    NEXT_PUBLIC_SERVER_API_ENDPOINT:
      process.env.NEXT_PUBLIC_SERVER_API_ENDPOINT,
    NEXT_PUBLIC_OCR_SERVER_API_ENDPOINT:
      process.env.NEXT_PUBLIC_OCR_SERVER_API_ENDPOINT,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_GOOGLE_OAUTH_ID: process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ID,
  },
});
