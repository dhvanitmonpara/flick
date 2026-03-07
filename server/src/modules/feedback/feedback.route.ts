import { Router } from "express";
import { authenticate, ensureRatelimit } from "@/core/middlewares";
import { adminOnly } from "@/core/middlewares/pipelines";
import feedbackController from "./feedback.controller";

const router = Router();

router.use(ensureRatelimit.api);

// Create feedback (authenticated users)
router.route("/").post(authenticate, feedbackController.createFeedback);

// List all feedbacks (admin only)
router.route("/").get(adminOnly, feedbackController.listFeedbacks);

// Get single feedback by ID (admin only)
router.route("/:id").get(adminOnly, feedbackController.getFeedbackById);

// Update feedback status (admin only)
router
	.route("/:id/status")
	.patch(adminOnly, feedbackController.updateFeedbackStatus);

// Delete feedback (admin only)
router.route("/:id").delete(adminOnly, feedbackController.deleteFeedback);

export default router;
