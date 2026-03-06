import { Router } from "express";
import ModerationController from "./content-moderation.controller";
import { authenticate, requireAuth, requireRole } from "@/core/middlewares";

const router = Router();

router.use(authenticate);
router.use(requireAuth);
router.use(requireRole("admin", "superadmin"));

router.put("/posts/:postId/moderation-state", ModerationController.upsertPostState);
router.put("/comments/:commentId/moderation-state", ModerationController.upsertCommentState);

export default router;
