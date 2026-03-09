import { Router } from "express";
import multer from "multer";
import { authenticate, ensureRatelimit, requireRole } from "@/core/middlewares";
import AdminController from "./admin.controller";
import BranchController from "./branch/branch.controller";

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
router.get("/college-requests", AdminController.getCollegeRequests);
router.post("/colleges/create", AdminController.createCollege);
router.patch("/colleges/update/:id", AdminController.updateCollege);
router.patch("/college-requests/:id", AdminController.updateCollegeRequest);
router.post(
	"/colleges/upload/profile/:id",
	uploadCollegeProfile.single("profile"),
	AdminController.uploadCollegeProfile,
);

router.get("/branches/all", BranchController.getAllBranches);
router.post("/branches/create", BranchController.createBranch);
router.patch("/branches/update/:id", BranchController.updateBranch);
router.delete("/branches/delete/:id", BranchController.deleteBranch);

router.get("/manage/logs", AdminController.getLogs);
router.get("/manage/feedback/all", AdminController.getAllFeedbacks);

export default router;
