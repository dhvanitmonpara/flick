import { createHash } from "node:crypto";
import axios from "axios";
import { env } from "@/config/env";
import { HttpError } from "@/core/http";

const getCloudinaryConfig = () => {
	const cloudName = env.CLOUDINARY_CLOUD_NAME;
	const apiKey = env.CLOUDINARY_API_KEY;
	const apiSecret = env.CLOUDINARY_API_SECRET;

	return { cloudName, apiKey, apiSecret };
};

export const uploadImageToCloudinary = async (
	file: Express.Multer.File,
	collegeId: string,
	folder = env.CLOUDINARY_UPLOAD_FOLDER,
) => {
	const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();

	const timestamp = Math.floor(Date.now() / 1000);
	const folderName = folder || "flick/colleges";

	const publicId = `college_${collegeId}_profile`;

	const paramsToSign = {
		folder: folderName,
		overwrite: "true",
		public_id: publicId,
		timestamp: String(timestamp),
		transformation: "c_fill,w_256,h_256,q_auto,f_auto",
	};

	const stringToSign =
		Object.keys(paramsToSign)
			.sort()
			.map((key) => `${key}=${paramsToSign[key as keyof typeof paramsToSign]}`)
			.join("&") + apiSecret;

	const signature = createHash("sha1").update(stringToSign).digest("hex");

	const formData = new FormData();
	const bytes = new Uint8Array(file.buffer);

	formData.append(
		"file",
		new Blob([bytes], { type: file.mimetype }),
		file.originalname,
	);
	formData.append("api_key", apiKey);
	formData.append("timestamp", String(timestamp));
	formData.append("folder", folderName);
	formData.append("public_id", publicId);
	formData.append("overwrite", "true");
	formData.append("transformation", "c_fill,w_256,h_256,q_auto,f_auto");
	formData.append("signature", signature);

	const response = await axios.post(
		`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
		formData,
	);

	const payload = response.data as {
		secure_url?: string;
		error?: { message?: string };
	};

	if (response.status !== 200 || !payload.secure_url) {
		const message =
			payload.error?.message || "Failed to upload image to Cloudinary";
		throw HttpError.badRequest(message);
	}

	return { url: payload.secure_url, publicId };
};
