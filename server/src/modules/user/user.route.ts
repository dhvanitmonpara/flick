import { Router } from "express";
import UserController from "@/modules/user/user.controller";
import { ensureRatelimit, injectUser, requireUser } from "@/core/middlewares";
import { authenticated } from "@/core/middlewares/pipelines";

const router = Router();

router.use(ensureRatelimit.api);
router.use(authenticated)

router.get("/id/:userId", UserController.getUserProfileById);
router.get("/search/:query", UserController.searchUsers);

router.use(injectUser);
router.use(requireUser);

router.get("/me", UserController.getUserProfile);
router.post("/accept-terms", UserController.acceptTerms);

export default router;
