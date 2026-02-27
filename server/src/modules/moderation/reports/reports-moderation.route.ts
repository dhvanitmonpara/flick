import { Router } from "express";
import ReportsController from "./reports-moderation.controller";
import { authenticate, requireAuth, requireRole, requireUser } from "@/core/middlewares";
import injectUser from "@/core/middlewares/auth/inject-user.middleware";

const router = Router();

router.use(authenticate);
router.use(requireAuth);

router.post("/", injectUser, requireUser, ReportsController.create);

router.use(requireRole("admin", "superadmin"));

router.get("/", ReportsController.list);
router.get("/users/:userId", ReportsController.listByUser);
router.get("/:id", ReportsController.getById);
router.patch("/:id", ReportsController.update);
router.delete("/:id", ReportsController.remove);
router.post("/bulk-deletion", ReportsController.bulkRemove);

export default router;
