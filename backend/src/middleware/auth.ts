import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/auth.js";

export interface AuthUser {
  id: number;
  email: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized: No token provided" });
    return;
  }

  const token = authHeader.substring(7);
  const payload = await verifyToken(token);

  if (!payload) {
    res.status(401).json({ message: "Unauthorized: Invalid token" });
    return;
  }

  req.user = {
    id: payload.userId as number,
    email: payload.email as string,
  };

  next();
}

export function optionalAuthMiddleware(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next();
    return;
  }

  const token = authHeader.substring(7);
  
  verifyToken(token).then((payload) => {
    if (payload) {
      req.user = {
        id: payload.userId as number,
        email: payload.email as string,
      };
    }
    next();
  }).catch(() => {
    next();
  });
}
