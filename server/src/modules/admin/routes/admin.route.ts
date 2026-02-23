import { Router } from "express";
import AdminController from "../admin.controller";
import { authenticate, ensureRatelimit, requireRole } from "@/core/middlewares";

const router = Router();

router.use(ensureRatelimit.api);
router.use(authenticate);
router.use(requireRole("admin"));

router.get("/dashboard/overview", AdminController.getOverview);

export default router;
