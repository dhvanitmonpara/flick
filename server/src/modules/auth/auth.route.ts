import { Router } from "express";
import AuthController from "@/modules/auth/auth.controller";
import { ensureRatelimit, injectUser, requireRole } from "@/core/middlewares";
import { authenticated } from "@/core/middlewares/pipelines";

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
router.use(authenticated);

router.post("/onboarding/complete", injectUser, AuthController.completeOnboarding);
router.post("/logout", AuthController.logoutUser);
router.post("/logout-all", AuthController.logoutAllDevices);
router.delete("/account", AuthController.deleteAccount);

router.use(requireRole("admin"))

router.get("/admins", AuthController.getAllAdmins);
router.get("/users", AuthController.getAllUsersForAdmin);

export default router;
