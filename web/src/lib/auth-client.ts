import { adminClient, inferAdditionalFields } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
export const authClient = createAuthClient({
  /** The base URL of the better auth endpoint on the server */
  baseURL: (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000") + "/api/auth",
  plugins: [
    adminClient(),
    inferAdditionalFields()
  ]
})
