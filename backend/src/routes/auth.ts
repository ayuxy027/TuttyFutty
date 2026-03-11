import { Router } from "express";
import { authController } from "../controllers/Index.js";
import { validateBody, apiRateLimit } from "../middleware/index.js";
import { authMiddleware } from "../middleware/auth.js";
import { z } from "zod";

const router = Router();

// Stricter validation schemas with required fields
const registerSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .max(254, "Email is too long")
    .email("Invalid email format"),
  password: z.string()
    .min(1, "Password is required")
    .regex(/^\d{4}$/, "Password must be exactly 4 digits"),
  name: z.string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
});

const loginSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .max(254, "Email is too long")
    .email("Invalid email format"),
  password: z.string()
    .min(1, "Password is required")
    .min(4, "Password must be 4 digits")
    .max(4, "Password must be 4 digits"),
});

const updateProfileSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
});

const changePasswordSchema = z.object({
  newPassword: z.string()
    .min(1, "New password is required")
    .regex(/^\d{4}$/, "New password must be exactly 4 digits"),
});

// Apply rate limiting to auth endpoints (DISABLED for development)
router.post("/register", validateBody(registerSchema), authController.register);
router.post("/login", validateBody(loginSchema), authController.login);
router.get("/me", apiRateLimit, authMiddleware, authController.me);
router.patch("/profile", apiRateLimit, authMiddleware, validateBody(updateProfileSchema), authController.updateProfile);
router.post("/change-password", apiRateLimit, authMiddleware, validateBody(changePasswordSchema), authController.changePassword);

export default router;
