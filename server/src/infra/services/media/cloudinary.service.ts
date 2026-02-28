import { createHash } from "node:crypto";
import { env } from "@/config/env";
import { HttpError } from "@/core/http";

const getCloudinaryConfig = () => {
  const cloudName = env.CLOUDINARY_CLOUD_NAME;
  const apiKey = env.CLOUDINARY_API_KEY;
  const apiSecret = env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw HttpError.badRequest("Cloudinary is not configured on the server");
  }

  return { cloudName, apiKey, apiSecret };
};

export const uploadImageToCloudinary = async (
  file: Express.Multer.File,
  folder = env.CLOUDINARY_UPLOAD_FOLDER
) => {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const folderName = folder || "flick/colleges";

  const signature = createHash("sha1")
    .update(`folder=${folderName}&timestamp=${timestamp}${apiSecret}`)
    .digest("hex");

  const formData = new FormData();
  const bytes = new Uint8Array(file.buffer);
  formData.append("file", new Blob([bytes], { type: file.mimetype }), file.originalname);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("folder", folderName);
  formData.append("signature", signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  const payload = await response.json() as { secure_url?: string; error?: { message?: string } };
  if (!response.ok || !payload.secure_url) {
    const message = payload.error?.message || "Failed to upload image to Cloudinary";
    throw HttpError.badRequest(message);
  }

  return payload.secure_url;
};
