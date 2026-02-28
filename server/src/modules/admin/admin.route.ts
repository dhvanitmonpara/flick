import { Router } from "express";
import multer from "multer";
import AdminController from "./admin.controller";
import { authenticate, ensureRatelimit, requireRole } from "@/core/middlewares";

const router = Router();
const uploadCollegeProfile = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.use(ensureRatelimit.api);
router.use(authenticate);
router.use(requireRole("admin"));

router.get("/dashboard/overview", AdminController.getOverview);
router.get("/manage/users/query", AdminController.manageUsersQuery);
router.get("/manage/reports", AdminController.getReports);
router.get("/colleges/get/all", AdminController.getAllColleges);
router.post("/colleges/create", AdminController.createCollege);
router.patch("/colleges/update/:id", AdminController.updateCollege);
router.post("/colleges/upload/profile/:id", uploadCollegeProfile.single("profile"), AdminController.uploadCollegeProfile);
router.get("/manage/logs", AdminController.getLogs);
router.get("/manage/feedback/all", AdminController.getAllFeedbacks);

export default router;
