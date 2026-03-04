import { Router } from "express";
import postController from "./post.controller";
import { checkUserContext, withOptionalUserContext } from "@/core/middlewares/pipelines";
import { ensureRatelimit, requireTerms, stopBannedUser } from "@/core/middlewares";

const router = Router();

router.use(ensureRatelimit.api);
router.use(withOptionalUserContext);

router.route("/").get(postController.getPosts);
router.route("/:id").get(postController.getPostById);
router.route("/:id/view").post(postController.incrementPostViews);
router.route("/college/:collegeId").get(postController.getPostsByCollege);
router.route("/branch/:branch").get(postController.getPostsByBranch);
router.route("/user/:userId").get(postController.getPostsByUser);

router.use(checkUserContext);

router.route("/").post(stopBannedUser, requireTerms, postController.createPost);
router.route("/:id").delete(postController.deletePost);
router.route("/:id").patch(stopBannedUser, requireTerms, postController.updatePost);

export default router;
