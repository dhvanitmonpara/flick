import { Router } from "express";
import { ensureRatelimit } from "@/core/middlewares";
import { withRequiredUserContext } from "@/core/middlewares/pipelines";
import bookmarkControllers from "./bookmark.controller";

const router = Router();

router.use(ensureRatelimit.api);
router.use(withRequiredUserContext);

router.route("/:postId").get(bookmarkControllers.getBookmark);
router.route("/user").get(bookmarkControllers.getUserBookmarkedPosts);
router.route("/delete/:postId").delete(bookmarkControllers.deleteBookmark);

// mutable requests
router.route("/").post(bookmarkControllers.createBookmark);

export default router;
