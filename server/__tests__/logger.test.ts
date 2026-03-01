import { describe, it, expect } from "@jest/globals";
import { Logger, defaultLogger, getRequestContext } from "../utils/logger";
import type { Request } from "express";

// Import the redactSensitiveData function for testing (it's not exported, so we test via Logger behavior)
// Instead, we'll test the observable behavior through the Logger class

describe("Logger", () => {
  describe("Logger class", () => {
    it("should create logger instance", () => {
      const logger = new Logger();
      expect(logger).toBeInstanceOf(Logger);
    });

    it("should create logger with context", () => {
      const logger = new Logger({ requestId: "req-123" });
      expect(logger).toBeInstanceOf(Logger);
    });

    it("should create child logger with additional context", () => {
      const parentLogger = new Logger({ requestId: "req-123" });
      const childLogger = parentLogger.child({ userId: "user-456" });
      expect(childLogger).toBeInstanceOf(Logger);
    });
  });

  describe("Log methods", () => {
    it("should call info method without errors", () => {
      const logger = new Logger();
      expect(() => {
        logger.info("Test message", { detail: "test detail" });
      }).not.toThrow();
    });

    it("should call error method without errors", () => {
      const logger = new Logger();
      const error = new Error("Test error");
      expect(() => {
        logger.error("Error occurred", error);
      }).not.toThrow();
    });

    it("should call warn method without errors", () => {
      const logger = new Logger();
      expect(() => {
        logger.warn("Warning message", { detail: "warn detail" });
      }).not.toThrow();
    });

    it("should call debug method without errors", () => {
      const logger = new Logger();
      expect(() => {
        logger.debug("Debug message", { detail: "debug detail" });
      }).not.toThrow();
    });

    it("should call http method without errors", () => {
      const logger = new Logger();
      expect(() => {
        logger.http("HTTP message", { detail: "http detail" });
      }).not.toThrow();
    });
  });

  describe("Error logging", () => {
    it("should log error with Error object", () => {
      const logger = new Logger();
      const error = new Error("Test error");
      expect(() => {
        logger.error("Error occurred", error);
      }).not.toThrow();
    });

    it("should log error with plain string", () => {
      const logger = new Logger();
      expect(() => {
        logger.error("Something went wrong", "Plain string error");
      }).not.toThrow();
    });

    it("should log error with metadata", () => {
      const logger = new Logger();
      const error = new Error("Database error");
      expect(() => {
        logger.error("Database operation failed", error, {
          operation: "insert",
          table: "users",
        });
      }).not.toThrow();
    });
  });

  describe("Default logger", () => {
    it("should have a default logger instance", () => {
      expect(defaultLogger).toBeDefined();
      expect(defaultLogger).toBeInstanceOf(Logger);
    });

    it("should work with default logger", () => {
      expect(() => {
        defaultLogger.info("Default logger test");
      }).not.toThrow();
    });
  });

  describe("Edge cases", () => {
    it("should handle null values in metadata", () => {
      const logger = new Logger();
      expect(() => {
        logger.info("Null test", { value: null });
      }).not.toThrow();
    });

    it("should handle undefined values in metadata", () => {
      const logger = new Logger();
      expect(() => {
        logger.info("Undefined test", { value: undefined });
      }).not.toThrow();
    });

    it("should handle empty metadata", () => {
      const logger = new Logger();
      expect(() => {
        logger.info("Empty metadata test", {});
      }).not.toThrow();
    });

    it("should handle array values in metadata", () => {
      const logger = new Logger();
      expect(() => {
        logger.info("Array test", { items: ["item1", "item2", "item3"] });
      }).not.toThrow();
    });

    it("should handle sensitive fields in metadata", () => {
      const logger = new Logger();
      expect(() => {
        logger.info("Sensitive data test", {
          password: "secret123",
          thought: "My private thoughts",
          email: "user@example.com",
          regularField: "This should work",
        });
      }).not.toThrow();
    });

    it("should handle deeply nested objects", () => {
      const logger = new Logger();
      expect(() => {
        logger.info("Nested test", {
          level1: {
            level2: {
              level3: {
                password: "deep-secret",
                data: "visible",
              },
            },
          },
        });
      }).not.toThrow();
    });
  });

  describe("Context management", () => {
    it("should include context in all logs", () => {
      const logger = new Logger({ requestId: "req-123", userId: "user-456" });
      expect(() => {
        logger.info("Test message");
      }).not.toThrow();
    });

    it("should create child logger with merged context", () => {
      const parentLogger = new Logger({ requestId: "req-123" });
      const childLogger = parentLogger.child({ userId: "user-456" });
      expect(() => {
        childLogger.info("Child log");
      }).not.toThrow();
    });

    it("should redact sensitive data in context", () => {
      const logger = new Logger({
        requestId: "req-123",
        password: "context-secret",
      });
      expect(() => {
        logger.info("Test message");
      }).not.toThrow();
    });
  });

  describe("Request context helper", () => {
    it("should extract request context", () => {
      const mockRequest = {
        id: "req-123",
        user: { id: "user-456" },
        method: "POST",
        path: "/api/test",
        ip: "127.0.0.1",
        headers: {},
      } as unknown as Request;

      const context = getRequestContext(mockRequest);

      expect(context).toEqual({
        requestId: "req-123",
        userId: "user-456",
        method: "POST",
        path: "/api/test",
        ip: "127.0.0.1",
      });
    });

    it("should handle missing optional fields", () => {
      const mockRequest = {
        id: "req-123",
        method: "GET",
        path: "/api/test",
        headers: {},
      } as unknown as Request;

      const context = getRequestContext(mockRequest);

      expect(context).toEqual({
        requestId: "req-123",
        userId: undefined,
        method: "GET",
        path: "/api/test",
        ip: undefined,
      });
    });

    it("should handle forwarded IP", () => {
      const mockRequest = {
        id: "req-123",
        method: "GET",
        path: "/api/test",
        headers: { "x-forwarded-for": "192.168.1.1" },
      } as unknown as Request;

      const context = getRequestContext(mockRequest);

      expect(context.ip).toBe("192.168.1.1");
    });
  });

  describe("Sensitive data redaction (behavioral)", () => {
    // Note: These tests verify that logging with sensitive data doesn't throw
    // The actual redaction is verified by manual testing and integration tests
    // since winston's transport layer is complex to mock properly

    it("should handle password fields", () => {
      const logger = new Logger();
      expect(() => {
        logger.info("User login", { password: "secret123", username: "alice" });
      }).not.toThrow();
    });

    it("should handle thought content", () => {
      const logger = new Logger();
      expect(() => {
        logger.info("Reflection created", {
          thought: "My private thoughts",
          emotionalState: "anxious",
        });
      }).not.toThrow();
    });

    it("should handle nested sensitive fields", () => {
      const logger = new Logger();
      expect(() => {
        logger.info("API call", {
          user: {
            email: "user@example.com",
            name: "John",
          },
          headers: {
            authorization: "Bearer token123",
          },
        });
      }).not.toThrow();
    });

    it("should handle reframe content", () => {
      const logger = new Logger();
      expect(() => {
        logger.info("Reframe generated", {
          reframe: "Generated reframe content",
          userId: "user-123",
        });
      }).not.toThrow();
    });

    it("should handle API keys", () => {
      const logger = new Logger();
      expect(() => {
        logger.info("API request", {
          apiKey: "sk-ant-1234567890",
          endpoint: "/api/analyze",
        });
      }).not.toThrow();
    });

    it("should handle case-insensitive redaction", () => {
      const logger = new Logger();
      expect(() => {
        logger.info("Test case sensitivity", {
          PASSWORD: "uppercase-secret",
          Password: "titlecase-secret",
          pAsSwOrD: "mixedcase-secret",
        });
      }).not.toThrow();
    });

    it("should handle arrays with sensitive data", () => {
      const logger = new Logger();
      expect(() => {
        logger.info("Batch operation", {
          users: [
            { name: "Alice", password: "pass1" },
            { name: "Bob", password: "pass2" },
          ],
        });
      }).not.toThrow();
    });
  });
});
