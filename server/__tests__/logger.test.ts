import { describe, it, expect } from '@jest/globals';
import { Logger, defaultLogger } from '../utils/logger';

describe('Logger', () => {
  describe('Logger class', () => {
    it('should create logger instance', () => {
      const logger = new Logger();
      expect(logger).toBeInstanceOf(Logger);
    });

    it('should create logger with context', () => {
      const logger = new Logger({ requestId: 'req-123' });
      expect(logger).toBeInstanceOf(Logger);
    });

    it('should create child logger with additional context', () => {
      const parentLogger = new Logger({ requestId: 'req-123' });
      const childLogger = parentLogger.child({ userId: 'user-456' });
      expect(childLogger).toBeInstanceOf(Logger);
    });
  });

  describe('Log methods', () => {
    it('should call info method without errors', () => {
      const logger = new Logger();
      expect(() => {
        logger.info('Test message', { detail: 'test detail' });
      }).not.toThrow();
    });

    it('should call error method without errors', () => {
      const logger = new Logger();
      const error = new Error('Test error');
      expect(() => {
        logger.error('Error occurred', error);
      }).not.toThrow();
    });

    it('should call warn method without errors', () => {
      const logger = new Logger();
      expect(() => {
        logger.warn('Warning message', { detail: 'warn detail' });
      }).not.toThrow();
    });

    it('should call debug method without errors', () => {
      const logger = new Logger();
      expect(() => {
        logger.debug('Debug message', { detail: 'debug detail' });
      }).not.toThrow();
    });

    it('should call http method without errors', () => {
      const logger = new Logger();
      expect(() => {
        logger.http('HTTP message', { detail: 'http detail' });
      }).not.toThrow();
    });
  });

  describe('Error logging', () => {
    it('should log error with Error object', () => {
      const logger = new Logger();
      const error = new Error('Test error');
      expect(() => {
        logger.error('Error occurred', error);
      }).not.toThrow();
    });

    it('should log error with plain string', () => {
      const logger = new Logger();
      expect(() => {
        logger.error('Something went wrong', 'Plain string error');
      }).not.toThrow();
    });

    it('should log error with metadata', () => {
      const logger = new Logger();
      const error = new Error('Database error');
      expect(() => {
        logger.error('Database operation failed', error, {
          operation: 'insert',
          table: 'users'
        });
      }).not.toThrow();
    });
  });

  describe('Default logger', () => {
    it('should have a default logger instance', () => {
      expect(defaultLogger).toBeDefined();
      expect(defaultLogger).toBeInstanceOf(Logger);
    });

    it('should work with default logger', () => {
      expect(() => {
        defaultLogger.info('Default logger test');
      }).not.toThrow();
    });
  });

  describe('Edge cases', () => {
    it('should handle null values in metadata', () => {
      const logger = new Logger();
      expect(() => {
        logger.info('Null test', { value: null });
      }).not.toThrow();
    });

    it('should handle undefined values in metadata', () => {
      const logger = new Logger();
      expect(() => {
        logger.info('Undefined test', { value: undefined });
      }).not.toThrow();
    });

    it('should handle empty metadata', () => {
      const logger = new Logger();
      expect(() => {
        logger.info('Empty metadata test', {});
      }).not.toThrow();
    });

    it('should handle array values in metadata', () => {
      const logger = new Logger();
      expect(() => {
        logger.info('Array test', { items: ['item1', 'item2', 'item3'] });
      }).not.toThrow();
    });

    it('should handle sensitive fields in metadata', () => {
      const logger = new Logger();
      expect(() => {
        logger.info('Sensitive data test', {
          password: 'secret123',
          thought: 'My private thoughts',
          email: 'user@example.com',
          regularField: 'This should work'
        });
      }).not.toThrow();
    });
  });
});
