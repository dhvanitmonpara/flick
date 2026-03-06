import axios from "axios";
import { env } from "@/config/env";

export const ocrApi = {
  extractStudentDetails: async (formData: FormData) => {
    return axios.post(
      `${env.NEXT_PUBLIC_OCR_SERVER_API_ENDPOINT}/extract`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
  },
};
