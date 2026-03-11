import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { createHash, createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";
import { env } from "../config/env.js";

const JWT_SECRET = env.JWT_SECRET || randomBytes(32).toString("hex");
const encoder = new TextEncoder();

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(password, salt, 64) as Buffer;
  return `${salt}:${key.toString("hex")}`;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [salt, key] = hash.split(":");
  const derivedKey = scryptSync(password, salt, 64) as Buffer;
  return key === derivedKey.toString("hex");
}

export async function createToken(userId: number, email: string): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET);
  
  return new SignJWT({ userId, email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}
