import { Router } from "express";
import UserController from "@/modules/user/user.controller";
import { authenticate, ensureRatelimit } from "@/core/middlewares";

const router = Router();

router.use(ensureRatelimit.api);
router.use(authenticate);

router.get("/me", UserController.getUserProfile);
router.post("/accept-terms", UserController.acceptTerms);
router.get("/id/:userId", UserController.getUserProfileById);
router.get("/search/:query", UserController.searchUsers);

export default router;
