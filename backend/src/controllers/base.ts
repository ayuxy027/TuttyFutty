import { Response } from "express";
import { AsyncRequestHandler, PaginatedResponse } from "../types/index.js";

export class BaseController {
  protected ok<T>(res: Response, data: T, message = "Success"): void {
    res.status(200).json({ message, data });
  }

  protected created<T>(res: Response, data: T, message = "Created"): void {
    res.status(201).json({ message, data });
  }

  protected paginated<T>(
    res: Response,
    data: T[],
    pagination: { page: number; limit: number; total: number }
  ): void {
    const response: PaginatedResponse<T> = {
      data,
      pagination: {
        ...pagination,
        totalPages: Math.ceil(pagination.total / pagination.limit),
      },
    };
    res.status(200).json(response);
  }

  protected noContent(res: Response): void {
    res.status(204).send();
  }

  protected badRequest(res: Response, message: string): void {
    res.status(400).json({ message });
  }

  protected unauthorized(res: Response, message = "Unauthorized"): void {
    res.status(401).json({ message });
  }

  protected forbidden(res: Response, message = "Forbidden"): void {
    res.status(403).json({ message });
  }

  protected notFound(res: Response, message = "Not found"): void {
    res.status(404).json({ message });
  }

  protected error(res: Response, message: string, statusCode = 500): void {
    res.status(statusCode).json({ message });
  }
}

export function asyncHandler<T = unknown, R = unknown>(
  fn: AsyncRequestHandler<T, R>
): AsyncRequestHandler<T, R> {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}
