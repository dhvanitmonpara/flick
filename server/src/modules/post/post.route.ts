import { Router } from "express";
import postController from "./post.controller";
import { authenticate } from "@/core/middlewares/auth";
import { validate } from "@/core/middlewares";
import * as postSchemas from "./post.schema";

const router = Router();

// Create post (authenticated users)
router
  .route("/")
  .post(
    authenticate,
    validate(postSchemas.createPostSchema),
    postController.createPost
  );

// Get all posts with filtering
router
  .route("/")
  .get(
    validate(postSchemas.getPostsQuerySchema, "query"),
    postController.getPosts
  );

// Get single post by ID
router
  .route("/:id")
  .get(
    validate(postSchemas.postIdSchema, "params"),
    postController.getPostById
  );

// Update post (author only)
router
  .route("/:id")
  .patch(
    authenticate,
    validate(postSchemas.postIdSchema, "params"),
    validate(postSchemas.updatePostSchema),
    postController.updatePost
  );

// Delete post (author only)
router
  .route("/:id")
  .delete(
    authenticate,
    validate(postSchemas.postIdSchema, "params"),
    postController.deletePost
  );

// Increment post views
router
  .route("/:id/view")
  .post(
    validate(postSchemas.postIdSchema, "params"),
    postController.incrementPostViews
  );

// Get posts by college
router
  .route("/college/:collegeId")
  .get(
    validate(postSchemas.getPostsQuerySchema, "query"),
    postController.getPostsByCollege
  );

// Get posts by branch
router
  .route("/branch/:branch")
  .get(
    validate(postSchemas.getPostsQuerySchema, "query"),
    postController.getPostsByBranch
  );

export default router;