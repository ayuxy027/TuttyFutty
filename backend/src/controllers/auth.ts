import { Request, Response } from "express";
import { z } from "zod";
import { BaseController, asyncHandler } from "../controllers/base.js";
import { db } from "../lib/db.js";
import { hashPassword, verifyPassword, createToken } from "../lib/auth.js";
import { AuthRequest } from "../middleware/auth.js";

// Password must be exactly 4 digits
const passwordSchema = z.string().refine(
  (val) => /^\d{4}$/.test(val),
  { message: "Password must be exactly 4 digits" }
);

// Name validation - required
const nameSchema = z.string()
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name must be less than 50 characters")
  .regex(/^[a-zA-Z\u00C0-\u00FF][a-zA-Z\u00C0-\u00FF\s'-]*[a-zA-Z\u00C0-\u00FF]$/, "Name can only contain letters, spaces, hyphens, and apostrophes");

const registerSchema = z.object({
  email: z.string().email().max(254),
  password: passwordSchema,
  name: nameSchema,
});

const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(4).max(4),
});

class AuthController extends BaseController {
  register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, name } = registerSchema.parse(req.body);

    // Check for existing user
    const existing = db.findOne("users", { email });
    if (existing) {
      // Generic error message for security - don't reveal if email exists
      this.badRequest(res, "Invalid credentials");
      return;
    }

    // Hash password with argon2
    const passwordHash = await hashPassword(password);

    // Create user with required name
    const user = db.create<{
      id: number;
      email: string;
      name: string;
      password_hash: string;
      created_at: string;
      updated_at: string;
    }>("users", {
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      name: name.trim(),
    });

    // Create auth token
    const token = await createToken(user.id, user.email);

    // Return user data and token
    this.created(res, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = loginSchema.parse(req.body);

    // Normalize email for lookup
    const normalizedEmail = email.toLowerCase().trim();

    const user = db.findOne<{
      id: number;
      email: string;
      password_hash: string;
      name: string;
    }>("users", { email: normalizedEmail });

    // Use constant-time comparison to prevent timing attacks
    if (!user) {
      // Generic error for security
      this.unauthorized(res, "Invalid credentials");
      return;
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      this.unauthorized(res, "Invalid credentials");
      return;
    }

    // Create auth token
    const token = await createToken(user.id, user.email);

    // Return user data and token
    this.ok(res, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  });

  me = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      this.unauthorized(res);
      return;
    }

    const user = db.findOne<{
      id: number;
      email: string;
      name: string;
      created_at: string;
    }>("users", { id: req.user.id });

    if (!user) {
      this.notFound(res, "User not found");
      return;
    }

    this.ok(res, {
      id: user.id,
      email: user.email,
      name: user.name,
      created_at: user.created_at,
    });
  });

  updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      this.unauthorized(res);
      return;
    }

    const { name } = req.body;

    // Validate name if provided
    if (name !== undefined) {
      const validationResult = nameSchema.safeParse(name);
      if (!validationResult.success) {
        this.badRequest(res, validationResult.error.errors[0].message);
        return;
      }
    }

    const user = db.update<{
      id: number;
      email: string;
      name: string;
    }>("users", req.user.id, { name: name?.trim() });

    this.ok(res, {
      id: user?.id,
      email: user?.email,
      name: user?.name,
    });
  });

  changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      this.unauthorized(res);
      return;
    }

    const { newPassword } = req.body;

    if (!newPassword) {
      this.badRequest(res, "New password is required");
      return;
    }

    // Validate new password format
    if (!/^\d{4}$/.test(newPassword)) {
      this.badRequest(res, "Password must be exactly 4 digits");
      return;
    }

    // Hash new password
    const newHash = await hashPassword(newPassword);

    // Update password
    db.update("users", req.user.id, { password_hash: newHash });

    this.ok(res, { message: "Password changed successfully" });
  });
}

export const authController = new AuthController();
