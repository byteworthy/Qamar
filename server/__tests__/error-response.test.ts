import { describe, it, expect } from '@jest/globals';
import {
  createErrorResponse,
  ERROR_CODES,
  HTTP_STATUS,
  type ErrorResponse,
} from '../types/error-response';
import { AppError } from '../middleware/error-handler';

describe('Error Response Format', () => {
  describe('createErrorResponse', () => {
    it('should create standard error response with required fields', () => {
      const response = createErrorResponse(
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.INVALID_INPUT,
        'req-123'
      );

      expect(response).toMatchObject({
        error: true,
        statusCode: 400,
        code: 'INVALID_INPUT',
        requestId: 'req-123',
      });
      expect(response.message).toBeDefined();
      expect(response.timestamp).toBeDefined();
    });

    it('should include custom message when provided', () => {
      const customMessage = 'Custom validation error';
      const response = createErrorResponse(
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_FAILED,
        'req-456',
        customMessage
      );

      expect(response.message).toBe(customMessage);
    });

    it('should include details when provided', () => {
      const details = { field: 'email', reason: 'invalid format' };
      const response = createErrorResponse(
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.INVALID_INPUT,
        'req-789',
        undefined,
        details
      );

      expect(response.details).toEqual(details);
    });

    it('should use default message when custom message not provided', () => {
      const response = createErrorResponse(
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.AUTH_REQUIRED,
        'req-999'
      );

      expect(response.message).toBe('Authentication is required to access this resource');
    });

    it('should include ISO 8601 timestamp', () => {
      const response = createErrorResponse(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.INTERNAL_ERROR,
        'req-abc'
      );

      const timestampRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
      expect(response.timestamp).toMatch(timestampRegex);
    });
  });

  describe('AppError', () => {
    it('should create error with status code and error code', () => {
      const error = new AppError(
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.FORBIDDEN,
        'Access denied'
      );

      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('FORBIDDEN');
      expect(error.message).toBe('Access denied');
    });

    it('should include details when provided', () => {
      const details = { resource: 'user', action: 'delete' };
      const error = new AppError(
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.INSUFFICIENT_PERMISSIONS,
        'Cannot delete user',
        details
      );

      expect(error.details).toEqual(details);
    });

    it('should capture stack trace', () => {
      const error = new AppError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.INTERNAL_ERROR,
        'Something went wrong'
      );

      expect(error.stack).toBeDefined();
      expect(error.name).toBe('AppError');
    });
  });

  describe('HTTP Status Codes', () => {
    it('should have correct status codes for common errors', () => {
      expect(HTTP_STATUS.BAD_REQUEST).toBe(400);
      expect(HTTP_STATUS.UNAUTHORIZED).toBe(401);
      expect(HTTP_STATUS.PAYMENT_REQUIRED).toBe(402);
      expect(HTTP_STATUS.FORBIDDEN).toBe(403);
      expect(HTTP_STATUS.NOT_FOUND).toBe(404);
      expect(HTTP_STATUS.TOO_MANY_REQUESTS).toBe(429);
      expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500);
      expect(HTTP_STATUS.SERVICE_UNAVAILABLE).toBe(503);
    });
  });

  describe('Error Codes', () => {
    it('should have appropriate error codes for different scenarios', () => {
      expect(ERROR_CODES.INVALID_INPUT).toBe('INVALID_INPUT');
      expect(ERROR_CODES.AUTH_REQUIRED).toBe('AUTH_REQUIRED');
      expect(ERROR_CODES.PAYMENT_REQUIRED).toBe('PAYMENT_REQUIRED');
      expect(ERROR_CODES.RATE_LIMIT_EXCEEDED).toBe('RATE_LIMIT_EXCEEDED');
      expect(ERROR_CODES.INTERNAL_ERROR).toBe('INTERNAL_ERROR');
      expect(ERROR_CODES.AI_SERVICE_UNAVAILABLE).toBe('AI_SERVICE_UNAVAILABLE');
    });
  });

  describe('Error Response Structure', () => {
    it('should match expected TypeScript interface', () => {
      const response: ErrorResponse = createErrorResponse(
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_FAILED,
        'req-test'
      );

      // Type checking - if this compiles, interface is correct
      expect(typeof response.error).toBe('boolean');
      expect(typeof response.statusCode).toBe('number');
      expect(typeof response.message).toBe('string');
      expect(typeof response.code).toBe('string');
      expect(typeof response.requestId).toBe('string');
      expect(typeof response.timestamp).toBe('string');
    });
  });
});
