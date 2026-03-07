import { Router } from "express";
import {
	ensureRatelimit,
	injectUser,
	requireOnboardedUser,
} from "@/core/middlewares";
import { authenticated } from "@/core/middlewares/pipelines";
import UserController from "@/modules/user/user.controller";

const router = Router();

router.use(ensureRatelimit.api);
router.use(authenticated);

router.get("/id/:userId", UserController.getUserProfileById);
router.get("/search/:query", UserController.searchUsers);

router.use(injectUser);
router.use(requireOnboardedUser);

router
	.route("/me")
	.get(UserController.getUserProfile)
	.patch(UserController.updateUserProfile);
router.post("/accept-terms", UserController.acceptTerms);

router.post("/block/:userId", UserController.blockUser);
router.post("/unblock/:userId", UserController.unblockUser);
router.get("/blocked", UserController.getBlockedUsers);

export default router;
