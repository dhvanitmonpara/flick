import { Router } from "express";
import UserController from "@/modules/user/user.controller";
import { injectUser } from "@/core/middlewares";
import { rateLimitAndAuthenticate } from "@/core/middlewares/pipelines";

const router = Router();

router.use(rateLimitAndAuthenticate);

router.get("/id/:userId", UserController.getUserProfileById);
router.get("/search/:query", UserController.searchUsers);

router.use(injectUser);

router.get("/me", UserController.getUserProfile);
router.post("/accept-terms", UserController.acceptTerms);

export default router;
