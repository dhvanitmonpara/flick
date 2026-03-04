import { Router } from "express";
import WordsModerationController from "./words-moderation.controller";
import { authenticate, ensureRatelimit, requireAuth, requireRole } from "@/core/middlewares";

const router = Router();

router.use(ensureRatelimit.api);

router.get("/config", WordsModerationController.getConfig);

router.use("/words", authenticate, requireAuth, requireRole("admin"));

router.get("/words", WordsModerationController.listWords);
router.post("/words", WordsModerationController.createWord);
router.patch("/words/:id", WordsModerationController.updateWord);
router.delete("/words/:id", WordsModerationController.deleteWord);

export default router;
