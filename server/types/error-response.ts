/**
 * Standard error response format for all API endpoints
 *
 * Ensures consistent error handling across the API with:
 * - Unified structure
 * - Request traceability via requestId
 * - HTTP status code adherence
 * - Actionable error messages
 */

export interface ErrorResponse {
  /** Error indicator - always true for error responses */
  error: true;

  /** HTTP status code (400-599) */
  statusCode: number;

  /** User-facing error message (safe to display) */
  message: string;

  /** Error code for programmatic handling (e.g., "INVALID_INPUT", "AUTH_REQUIRED") */
  code: string;

  /** Request ID for log correlation and debugging */
  requestId: string;

  /** Timestamp when error occurred (ISO 8601 format) */
  timestamp: string;

  /** Optional: Additional error details for debugging (not shown to end users) */
  details?: Record<string, unknown>;
}

/**
 * Standard error codes following REST conventions
 */
export const ERROR_CODES = {
  // 400 - Client Errors
  INVALID_INPUT: 'INVALID_INPUT',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // 401 - Authentication
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_INVALID: 'AUTH_INVALID',
  SESSION_EXPIRED: 'SESSION_EXPIRED',

  // 402 - Payment
  PAYMENT_REQUIRED: 'PAYMENT_REQUIRED',
  SUBSCRIPTION_INACTIVE: 'SUBSCRIPTION_INACTIVE',

  // 403 - Authorization
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // 404 - Not Found
  NOT_FOUND: 'NOT_FOUND',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',

  // 409 - Conflict
  CONFLICT: 'CONFLICT',
  DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',

  // 429 - Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',

  // 500 - Server Errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',

  // 503 - Service Unavailable
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  AI_SERVICE_UNAVAILABLE: 'AI_SERVICE_UNAVAILABLE',
  MAINTENANCE_MODE: 'MAINTENANCE_MODE',
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;

/**
 * Standard error messages by code
 */
const ERROR_MESSAGES: Record<string, string> = {
  INVALID_INPUT: 'The provided input is invalid',
  VALIDATION_FAILED: 'Request validation failed',
  MISSING_REQUIRED_FIELD: 'Required field is missing',

  AUTH_REQUIRED: 'Authentication is required to access this resource',
  AUTH_INVALID: 'Invalid authentication credentials',
  SESSION_EXPIRED: 'Your session has expired. Please sign in again',

  PAYMENT_REQUIRED: 'Payment is required to access this feature',
  SUBSCRIPTION_INACTIVE: 'Your subscription is inactive',

  FORBIDDEN: 'You do not have permission to access this resource',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions for this action',

  NOT_FOUND: 'The requested resource was not found',
  RESOURCE_NOT_FOUND: 'Resource not found',

  CONFLICT: 'The request conflicts with the current state',
  DUPLICATE_RESOURCE: 'A resource with these properties already exists',

  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded. Please try again later',
  TOO_MANY_REQUESTS: 'Too many requests. Please slow down',

  INTERNAL_ERROR: 'An internal server error occurred',
  DATABASE_ERROR: 'A database error occurred',

  SERVICE_UNAVAILABLE: 'Service is temporarily unavailable',
  AI_SERVICE_UNAVAILABLE: 'AI service is temporarily unavailable',
  MAINTENANCE_MODE: 'Service is under maintenance',
};

/**
 * Create a standard error response
 */
export function createErrorResponse(
  statusCode: number,
  code: string,
  requestId: string,
  customMessage?: string,
  details?: Record<string, unknown>
): ErrorResponse {
  return {
    error: true,
    statusCode,
    code,
    message: customMessage || ERROR_MESSAGES[code] || 'An error occurred',
    requestId,
    timestamp: new Date().toISOString(),
    ...(details && { details }),
  };
}

/**
 * HTTP Status codes with descriptions
 */
export const HTTP_STATUS = {
  // Success
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,

  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // Server Errors
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  SERVICE_UNAVAILABLE: 503,
} as const;
