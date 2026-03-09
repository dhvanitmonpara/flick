import { Router } from "express";
import { ensureRatelimit } from "@/core/middlewares";
import { adminOnly } from "@/core/middlewares/pipelines";
import collegeController from "./college.controller";

const router = Router();

router.use(ensureRatelimit.api);

router.route("/").post(adminOnly, collegeController.createCollege);
router.route("/").get(collegeController.getColleges);
router.route("/requests").post(collegeController.createCollegeRequest);
router.route("/:id").get(collegeController.getCollegeById);
router.route("/:id/branches").get(collegeController.getCollegeBranches);
router.route("/:id").patch(adminOnly, collegeController.updateCollege);
router.route("/:id").delete(adminOnly, collegeController.deleteCollege);

export default router;
