import { Router } from "express";
import bookmarkControllers from "./bookmark.controller";
import {
  blockSuspensionMiddleware,
  authenticate,
} from "@/core/middlewares/auth";
import { rateLimitMiddleware, validate } from "@/core/middlewares";
import * as bookmarkSchemas from "./bookmark.schema";

const router = Router();

router.use(rateLimitMiddleware.apiRateLimiter);
router.use(authenticate)

router.route("/").post(blockSuspensionMiddleware, validate(bookmarkSchemas.postIdSchema), bookmarkControllers.createBookmark)
router.route("/:postId").get(validate(bookmarkSchemas.postIdSchema, "params"), bookmarkControllers.getBookmark);
router.route("/user").get(bookmarkControllers.getUserBookmarkedPosts);
router.route("/delete/:postId").delete(validate(bookmarkSchemas.postIdSchema, "params"), bookmarkControllers.deleteBookmark);

export default router;