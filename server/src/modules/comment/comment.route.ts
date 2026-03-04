import { Router } from "express";
import commentController from "./comment.controller";
import { ensureRatelimit, requireTerms, stopBannedUser } from "@/core/middlewares";
import { checkUserContext, withOptionalUserContext } from "@/core/middlewares/pipelines";

const router = Router();

router.use(ensureRatelimit.api);
router.use(withOptionalUserContext);

router.route("/:commentId").get(commentController.getCommentById);
router.route("/post/:postId").get(commentController.getCommentsByPostId);

router.use(checkUserContext);

router.route("/post/:postId").post(stopBannedUser, requireTerms, commentController.createComment);
router.route("/:commentId").patch(stopBannedUser, requireTerms, commentController.updateComment);
router.route("/:commentId").delete(commentController.deleteComment);

export default router;
