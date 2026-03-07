import type { Request } from "express";
import { Controller, HttpResponse } from "@/core/http";
import HttpError from "@/core/http/error";
import * as moderationSchemas from "./content-moderation.schema";
import ContentModerationService from "./content-moderation.service";

const ignoredModerationErrors = [
	"already banned",
	"not banned",
	"already shadow banned",
	"not shadow banned",
];

const tryBestEffort = async (handler: () => Promise<unknown>) => {
	try {
		await handler();
	} catch (error) {
		if (
			!(error instanceof HttpError) ||
			!ignoredModerationErrors.some((fragment) =>
				error.message.toLowerCase().includes(fragment),
			)
		) {
			throw error;
		}
	}
};

@Controller()
class ModerationController {
	static async upsertPostState(req: Request) {
		const { postId } = moderationSchemas.postIdParamsSchema.parse(req.params);
		const { state } = moderationSchemas.postModerationStateSchema.parse(
			req.body,
		);

		if (state === "active") {
			await tryBestEffort(() => ContentModerationService.unbanPost(postId));
			await tryBestEffort(() =>
				ContentModerationService.shadowUnbanPost(postId),
			);
		}

		if (state === "banned") {
			await tryBestEffort(() =>
				ContentModerationService.shadowUnbanPost(postId),
			);
			await tryBestEffort(() => ContentModerationService.banPost(postId));
		}

		if (state === "shadow_banned") {
			await tryBestEffort(() => ContentModerationService.unbanPost(postId));
			await tryBestEffort(() => ContentModerationService.shadowBanPost(postId));
		}

		return HttpResponse.ok("Post moderation state updated", {
			resource: "post",
			resourceId: postId,
			moderationState: state,
		});
	}

	static async upsertCommentState(req: Request) {
		const { commentId } = moderationSchemas.commentIdParamsSchema.parse(
			req.params,
		);
		const { state } = moderationSchemas.commentModerationStateSchema.parse(
			req.body,
		);

		if (state === "active") {
			await tryBestEffort(() =>
				ContentModerationService.unbanComment(commentId),
			);
		}

		if (state === "banned") {
			await tryBestEffort(() => ContentModerationService.banComment(commentId));
		}

		return HttpResponse.ok("Comment moderation state updated", {
			resource: "comment",
			resourceId: commentId,
			moderationState: state,
		});
	}
}

export default ModerationController;
