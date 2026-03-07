import { Router } from "express";
import { authenticate, requireAuth, requireRole } from "@/core/middlewares";
import ModerationController from "./content-moderation.controller";

const router = Router();

router.use(authenticate);
router.use(requireAuth);
router.use(requireRole("admin", "superadmin"));

router.put(
	"/posts/:postId/moderation-state",
	ModerationController.upsertPostState,
);
router.put(
	"/comments/:commentId/moderation-state",
	ModerationController.upsertCommentState,
);

export default router;
