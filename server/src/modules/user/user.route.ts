import { Router } from "express";
import UserController from "@/modules/user/user.controller";
import { authenticate, ensureRatelimit } from "@/core/middlewares";

const router = Router();

router.use(ensureRatelimit.api);
router.use(authenticate);

router.get("/me", UserController.getUserData);
router.get("/id/:userId", UserController.getUserById);
router.get("/search/:query", UserController.searchUsers);

export default router;
