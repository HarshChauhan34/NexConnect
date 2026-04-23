import express from "express";
import {
  registerUser,
  adminCreateUser,
  loginUser,
  refreshSession,
  logoutUser,
  getMe,
  updateProfile,
  updateAvatar,
  requestOrganizerRole,
  getOrganizerRequests,
  reviewOrganizerRequest,
  forgotPassword,
  resetPassword,
  searchUsers,
} from "../controllers/authController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";
import upload from "../config/cloudinaryMulter.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  adminCreateUserSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  organizerRequestSchema,
  organizerReviewSchema,
  updateProfileSchema,
} from "../validations/authSchemas.js";

const router = express.Router();

router.post("/register", validateRequest(registerSchema), registerUser);
router.post("/admin/create-user", protect, authorizeRoles("admin"), validateRequest(adminCreateUserSchema), adminCreateUser);
router.post("/login", validateRequest(loginSchema), loginUser);
router.post("/refresh", refreshSession);
router.post("/logout", logoutUser);
router.post("/forgot-password", validateRequest(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validateRequest(resetPasswordSchema), resetPassword);
router.get("/me", protect, getMe);
router.put("/profile", protect, validateRequest(updateProfileSchema), updateProfile);
router.put("/profile/avatar", protect, upload.single("avatar"), updateAvatar);
router.get("/users", protect, searchUsers);
router.post(
  "/organizer-request",
  protect,
  authorizeRoles("user"),
  validateRequest(organizerRequestSchema),
  requestOrganizerRole,
);
router.get(
  "/organizer-requests",
  protect,
  authorizeRoles("admin"),
  getOrganizerRequests,
);
router.put(
  "/organizer-requests/:userId",
  protect,
  authorizeRoles("admin"),
  validateRequest(organizerReviewSchema),
  reviewOrganizerRequest,
);

export default router;
