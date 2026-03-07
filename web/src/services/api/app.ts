import axios from "axios";
import { env } from "@/config/env";

export const appApi = {
  health: async () => {
    return axios.get(
      `${new URL(env.NEXT_PUBLIC_SERVER_API_ENDPOINT).origin}/healthz`,
    );
  },
};
