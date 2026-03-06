import { Router } from "express";
import UserAdminController from "./user-moderation.controller";
import { authenticate, requireAuth, requireRole } from "@/core/middlewares";

const router = Router();

router.use(authenticate);
router.use(requireAuth);
router.use(requireRole("admin", "superadmin"));

router.get("/", UserAdminController.list);
router.get("/search", UserAdminController.search);
router.put("/:userId/moderation-state", UserAdminController.upsertModerationState);
router.get("/:userId/suspension", UserAdminController.getSuspension);

export default router;
