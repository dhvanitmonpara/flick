import { Router } from "express";
import commentController from "./comment.controller";
import { authenticate } from "@/core/middlewares/auth";
import { rateLimitMiddleware, validate } from "@/core/middlewares";
import * as commentSchemas from "./comment.schema";

const router = Router();

router.use(rateLimitMiddleware.apiRateLimiter);

// Get comments by post ID
router
  .route("/post/:postId")
  .get(
    validate(commentSchemas.postIdSchema, "params"),
    validate(commentSchemas.getCommentsQuerySchema, "query"),
    commentController.getCommentsByPostId
  );

// Create comment for a post
router
  .route("/post/:postId")
  .post(
    authenticate,
    validate(commentSchemas.postIdSchema, "params"),
    validate(commentSchemas.createCommentSchema),
    commentController.createComment
  );

// Get single comment by ID
router
  .route("/:commentId")
  .get(
    validate(commentSchemas.commentIdSchema, "params"),
    commentController.getCommentById
  );

// Update comment
router
  .route("/:commentId")
  .patch(
    authenticate,
    validate(commentSchemas.commentIdSchema, "params"),
    validate(commentSchemas.updateCommentSchema),
    commentController.updateComment
  );

// Delete comment
router
  .route("/:commentId")
  .delete(
    authenticate,
    validate(commentSchemas.commentIdSchema, "params"),
    commentController.deleteComment
  );

export default router;