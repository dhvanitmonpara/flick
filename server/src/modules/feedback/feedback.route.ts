import { Router } from "express";
import feedbackController from "./feedback.controller";
import { rateLimitMiddleware, authenticate, validate, adminOnly } from "@/core/middlewares";
import * as feedbackSchemas from "./feedback.schema";

const router = Router();

router.use(rateLimitMiddleware.apiRateLimiter);

// Create feedback (authenticated users)
router
  .route("/")
  .post(
    authenticate,
    validate(feedbackSchemas.createFeedbackSchema),
    feedbackController.createFeedback
  );

// List all feedbacks (admin only)
router
  .route("/")
  .get(
    adminOnly,
    validate(feedbackSchemas.listFeedbacksQuerySchema, "query"),
    feedbackController.listFeedbacks
  );

// Get single feedback by ID (admin only)
router
  .route("/:id")
  .get(
    adminOnly,
    validate(feedbackSchemas.feedbackIdSchema, "params"),
    feedbackController.getFeedbackById
  );

// Update feedback status (admin only)
router
  .route("/:id/status")
  .patch(
    adminOnly,
    validate(feedbackSchemas.feedbackIdSchema, "params"),
    validate(feedbackSchemas.updateFeedbackStatusSchema),
    feedbackController.updateFeedbackStatus
  );

// Delete feedback (admin only)
router
  .route("/:id")
  .delete(
    adminOnly,
    validate(feedbackSchemas.feedbackIdSchema, "params"),
    feedbackController.deleteFeedback
  );

export default router;