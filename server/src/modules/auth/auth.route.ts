import { Router } from "express";
import AuthController from "@/modules/auth/auth.controller";
import { authenticate, ensureRatelimit, requireRole } from "@/core/middlewares";

const router = Router();

router.use(ensureRatelimit.auth);

router.post("/login", AuthController.loginUser);
router.post("/refresh", AuthController.refreshAccessToken);
router.post("/otp/send", AuthController.sendOtp);
router.post("/otp/verify", AuthController.verifyOtp);
router.post("/registration/verify-otp", AuthController.verifyUserOtp);
router.post("/registration/initialize", AuthController.initializeUser);
router.post("/registration/finalize", AuthController.registerUser);
router.get("/google/callback", AuthController.googleCallback);
router.post("/password/forgot", AuthController.forgotPassword);
router.post("/password/reset", AuthController.resetPassword);

// Protected routes
router.use(authenticate);

router.post("/logout", AuthController.logoutUser);
router.post("/logout-all", AuthController.logoutAllDevices);
router.delete("/account", AuthController.deleteAccount);
router.get("/admins", requireRole("admin", "superadmin"), AuthController.getAllAdmins);
router.get("/users", requireRole("admin", "superadmin"), AuthController.getAllUsersForAdmin);

export default router;
