import { Router } from "express";
import AdminController from "./admin.controller";
import { authenticate, ensureRatelimit, requireRole } from "@/core/middlewares";

const router = Router();

router.use(ensureRatelimit.api);
router.use(authenticate);
router.use(requireRole("admin"));

router.get("/dashboard/overview", AdminController.getOverview);
router.get("/manage/users/query", AdminController.manageUsersQuery);
router.get("/manage/reports", AdminController.getReports);
router.get("/colleges/get/all", AdminController.getAllColleges);
router.get("/manage/logs", AdminController.getLogs);
router.get("/manage/feedback/all", AdminController.getAllFeedbacks);

export default router;
