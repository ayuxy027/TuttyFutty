import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("Error:", err.message);

  if (err instanceof ZodError) {
    res.status(400).json({
      message: "Validation error",
      errors: err.errors,
    });
    return;
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? "Internal server error" : err.message;

  res.status(statusCode).json({
    message,
    code: err.code,
  });
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({
    message: "Route not found",
  });
}

export function createError(message: string, statusCode: number, code?: string): AppError {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}
