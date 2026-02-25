import { Router } from "express";
import postController from "./post.controller";
import { checkUserContext, withOptionalUserContext } from "@/core/middlewares/pipelines";
import { ensureRatelimit } from "@/core/middlewares";

const router = Router();

router.use(ensureRatelimit.api);
router.use(withOptionalUserContext);

router.route("/").get(postController.getPosts);
router.route("/:id").get(postController.getPostById);
router.route("/:id/view").post(postController.incrementPostViews);
router.route("/college/:collegeId").get(postController.getPostsByCollege);
router.route("/branch/:branch").get(postController.getPostsByBranch);

router.use(checkUserContext);

router.route("/").post(postController.createPost);
router.route("/:id").delete(postController.deletePost);
router.route("/:id").patch(postController.updatePost);

export default router;