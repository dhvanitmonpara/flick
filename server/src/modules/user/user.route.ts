import { Router } from "express";
import UserController from "@/modules/user/user.controller";
import { ensureRatelimit, injectUser, requireOnboardedUser } from "@/core/middlewares";
import { authenticated } from "@/core/middlewares/pipelines";

const router = Router();

router.use(ensureRatelimit.api);
router.use(authenticated)

router.get("/id/:userId", UserController.getUserProfileById);
router.get("/search/:query", UserController.searchUsers);

router.use(injectUser);
router.use(requireOnboardedUser);

router.route("/me")
  .get(UserController.getUserProfile)
  .patch(UserController.updateUserProfile);
router.post("/accept-terms", UserController.acceptTerms);

export default router;
