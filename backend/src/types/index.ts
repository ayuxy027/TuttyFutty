import { Request, Response, NextFunction } from "express";

export interface ApiError {
  message: string;
  statusCode: number;
  code?: string;
}

export interface TypedRequest<T = unknown> extends Request {
  body: T;
}

export interface TypedResponse<T = unknown> extends Response {
  json: (body: T) => this;
}

export type AsyncRequestHandler<T = unknown, R = unknown> = (
  req: TypedRequest<T>,
  res: TypedResponse<R>,
  next: NextFunction
) => Promise<void | R>;

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface HealthCheck {
  status: "ok" | "error";
  timestamp: string;
  uptime: number;
  services: {
    sqlite: "connected" | "disconnected";
    gemini: "connected" | "disconnected" | "not_configured";
  };
}
