import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import {
  createErrorResponse,
  ERROR_CODES,
  HTTP_STATUS,
  type ErrorResponse,
} from "../types/error-response";
import { defaultLogger } from "../utils/logger";

/**
 * Custom error class that includes error code and status
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "AppError";
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Centralized error handler middleware
 *
 * Catches all errors thrown in routes/middleware and returns
 * standardized error responses with proper logging.
 *
 * Must be registered AFTER all routes in Express app.
 */
export function errorHandler(
  error: Error | AppError | ZodError,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Get requestId from request (added by request-logger middleware)
  const requestId = req.id || "unknown";

  let errorResponse: ErrorResponse;

  // Handle different error types
  if (error instanceof AppError) {
    // Application errors with known status and code
    errorResponse = createErrorResponse(
      error.statusCode,
      error.code,
      requestId,
      error.message,
      error.details,
    );

    // Log based on status code
    if (error.statusCode >= 500) {
      req.logger?.error("Application error", error, {
        code: error.code,
        statusCode: error.statusCode,
      });
    } else {
      req.logger?.warn("Client error", {
        code: error.code,
        statusCode: error.statusCode,
        message: error.message,
      });
    }
  } else if (error instanceof ZodError) {
    // Validation errors from Zod
    const details = error.errors.map((err) => ({
      path: err.path.join("."),
      message: err.message,
    }));

    errorResponse = createErrorResponse(
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.VALIDATION_FAILED,
      requestId,
      "Request validation failed",
      { validationErrors: details },
    );

    req.logger?.warn("Validation error", {
      validationErrors: details,
    });
  } else {
    // Unknown/unexpected errors - treat as internal server error
    errorResponse = createErrorResponse(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_CODES.INTERNAL_ERROR,
      requestId,
      "An unexpected error occurred",
    );

    req.logger?.error("Unexpected error", error, {
      errorName: error.name,
      errorMessage: error.message,
    });
  }

  // Send error response
  res.status(errorResponse.statusCode).json(errorResponse);
}

/**
 * Helper to create and throw an AppError
 */
export function throwError(
  statusCode: number,
  code: string,
  message?: string,
  details?: Record<string, unknown>,
): never {
  throw new AppError(statusCode, code, message || "", details);
}

/**
 * Async handler wrapper to catch promise rejections
 *
 * Usage:
 *   app.get('/route', asyncHandler(async (req, res) => {
 *     // Async code here - errors automatically caught
 *   }));
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
