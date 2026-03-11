import { Request, Response } from "express";
import { z } from "zod";
import { BaseController, asyncHandler } from "../controllers/base.js";
import { db } from "../lib/db.js";
import { hashPassword, verifyPassword, createToken } from "../lib/auth.js";
import { AuthRequest } from "../middleware/auth.js";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

class AuthController extends BaseController {
  register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, name } = registerSchema.parse(req.body);

    const existing = db.findOne("users", { email });
    if (existing) {
      this.badRequest(res, "Email already registered");
      return;
    }

    const passwordHash = await hashPassword(password);
    const user = db.create<{
      id: number;
      email: string;
      name: string | null;
      password_hash: string;
      created_at: string;
      updated_at: string;
    }>("users", {
      email,
      password_hash: passwordHash,
      name: name || null,
    });

    const token = await createToken(user.id, user.email);

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

    const user = db.findOne<{
      id: number;
      email: string;
      password_hash: string;
      name: string | null;
    }>("users", { email });

    if (!user) {
      this.unauthorized(res, "Invalid email or password");
      return;
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      this.unauthorized(res, "Invalid email or password");
      return;
    }

    const token = await createToken(user.id, user.email);

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
      name: string | null;
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
    const user = db.update<{
      id: number;
      email: string;
      name: string | null;
    }>("users", req.user.id, { name: name || null });

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

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      this.badRequest(res, "Current and new password required");
      return;
    }

    if (newPassword.length < 8) {
      this.badRequest(res, "Password must be at least 8 characters");
      return;
    }

    const user = db.findOne<{ password_hash: string }>("users", { id: req.user.id });
    if (!user) {
      this.notFound(res, "User not found");
      return;
    }

    const isValid = await verifyPassword(currentPassword, user.password_hash);
    if (!isValid) {
      this.unauthorized(res, "Current password is incorrect");
      return;
    }

    const newHash = await hashPassword(newPassword);
    db.update("users", req.user.id, { password_hash: newHash });

    this.ok(res, { message: "Password changed successfully" });
  });
}

export const authController = new AuthController();
