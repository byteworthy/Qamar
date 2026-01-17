/**
 * Safety Telemetry System for Noor CBT
 * 
 * PRIORITY 3: Internal metrics only - NO behavioral tracking
 * 
 * Metrics Tracked:
 * - Number of violations by category
 * - Average distress state duration
 * - Frequency of reframing permission declines
 * - Crisis escalation counts
 * 
 * Purpose: System health, NOT user manipulation
 * 
 * Last Updated: 2026-01-17
 */

import type { DistressLevel } from '../shared/islamic-framework';
import type { ViolationSeverity } from './charter-compliance';

// =============================================================================
// TELEMETRY EVENT TYPES
// =============================================================================

export type TelemetryEvent =
  | { type: 'violation'; category: string; severity: ViolationSeverity; timestamp: number }
  | { type: 'crisis_detected'; level: string; timestamp: number }
  | { type: 'reframing_declined'; timestamp: number }
  | { type: 'distress_state_change'; from: DistressLevel; to: DistressLevel; timestamp: number }
  | { type: 'system_failure'; category: string; timestamp: number }
  | { type: 'response_approved'; timestamp: number };

// =============================================================================
// TELEMETRY STORAGE
// =============================================================================

interface ViolationMetrics {
  category: string;
  count: number;
  severityBreakdown: {
    minor: number;
    major: number;
    critical: number;
  };
  lastOccurrence: number;
}

interface DistressMetrics {
  level: DistressLevel;
  totalDuration: number; // milliseconds
  occurrences: number;
  averageDuration: number;
}

interface CrisisMetrics {
  totalEvents: number;
  emergencyLevel: number;
  urgentLevel: number;
  watchLevel: number;
  lastCrisisTimestamp?: number;
}

interface ReframingMetrics {
  totalRequests: number;
  declines: number;
  accepts: number;
  declineRate: number;
}

interface SystemHealthMetrics {
  totalResponses: number;
  successfulResponses: number;
  failedResponses: number;
  successRate: number;
  failures: {
    category: string;
    count: number;
  }[];
}

// =============================================================================
// TELEMETRY COLLECTOR
// =============================================================================

export class SafetyTelemetry {
  private static violations: Map<string, ViolationMetrics> = new Map();
  private static distressStates: Map<DistressLevel, DistressMetrics> = new Map();
  private static distressTransitions: Array<{ from: DistressLevel; to: DistressLevel; timestamp: number; duration: number }> = [];
  private static crisisMetrics: CrisisMetrics = {
    totalEvents: 0,
    emergencyLevel: 0,
    urgentLevel: 0,
    watchLevel: 0,
  };
  private static reframingMetrics: ReframingMetrics = {
    totalRequests: 0,
    declines: 0,
    accepts: 0,
    declineRate: 0,
  };
  private static systemHealth: SystemHealthMetrics = {
    totalResponses: 0,
    successfulResponses: 0,
    failedResponses: 0,
    successRate: 100,
    failures: [],
  };
  private static currentDistressStart: Map<string, { level: DistressLevel; timestamp: number }> = new Map();

  // ===========================================================================
  // VIOLATION TRACKING
  // ===========================================================================

  static recordViolation(category: string, severity: ViolationSeverity): void {
    const existing = this.violations.get(category) || {
      category,
      count: 0,
      severityBreakdown: { minor: 0, major: 0, critical: 0 },
      lastOccurrence: 0,
    };

    existing.count++;
    existing.severityBreakdown[severity]++;
    existing.lastOccurrence = Date.now();

    this.violations.set(category, existing);
  }

  static getViolationMetrics(): ViolationMetrics[] {
    return Array.from(this.violations.values());
  }

  static getViolationsByCategory(category: string): ViolationMetrics | undefined {
    return this.violations.get(category);
  }

  static getTotalViolations(): number {
    return Array.from(this.violations.values()).reduce((sum, v) => sum + v.count, 0);
  }

  // ===========================================================================
  // DISTRESS STATE TRACKING
  // ===========================================================================

  static startDistressState(userId: string, level: DistressLevel): void {
    this.currentDistressStart.set(userId, {
      level,
      timestamp: Date.now(),
    });
  }

  static endDistressState(userId: string, newLevel: DistressLevel): void {
    const start = this.currentDistressStart.get(userId);
    if (!start) return;

    const duration = Date.now() - start.timestamp;
    
    // Update distress metrics
    const existing = this.distressStates.get(start.level) || {
      level: start.level,
      totalDuration: 0,
      occurrences: 0,
      averageDuration: 0,
    };

    existing.totalDuration += duration;
    existing.occurrences++;
    existing.averageDuration = existing.totalDuration / existing.occurrences;

    this.distressStates.set(start.level, existing);

    // Record transition
    this.distressTransitions.push({
      from: start.level,
      to: newLevel,
      timestamp: Date.now(),
      duration,
    });

    // Limit transition history
    if (this.distressTransitions.length > 1000) {
      this.distressTransitions.shift();
    }

    // Start new state
    this.currentDistressStart.set(userId, {
      level: newLevel,
      timestamp: Date.now(),
    });
  }

  static getDistressMetrics(level?: DistressLevel): DistressMetrics | DistressMetrics[] {
    if (level) {
      return this.distressStates.get(level) || {
        level,
        totalDuration: 0,
        occurrences: 0,
        averageDuration: 0,
      };
    }
    return Array.from(this.distressStates.values());
  }

  static getAverageDistressDuration(level: DistressLevel): number {
    const metrics = this.distressStates.get(level);
    return metrics?.averageDuration || 0;
  }

  // ===========================================================================
  // CRISIS TRACKING
  // ===========================================================================

  static recordCrisisEvent(level: 'none' | 'concern' | 'urgent' | 'emergency'): void {
    this.crisisMetrics.totalEvents++;
    this.crisisMetrics.lastCrisisTimestamp = Date.now();

    switch (level) {
      case 'emergency':
        this.crisisMetrics.emergencyLevel++;
        break;
      case 'urgent':
        this.crisisMetrics.urgentLevel++;
        break;
      case 'concern':
        this.crisisMetrics.watchLevel++;
        break;
    }
  }

  static getCrisisMetrics(): CrisisMetrics {
    return { ...this.crisisMetrics };
  }

  static getCrisisEscalationRate(): number {
    const total = this.crisisMetrics.totalEvents;
    if (total === 0) return 0;
    
    const escalated = this.crisisMetrics.emergencyLevel + this.crisisMetrics.urgentLevel;
    return (escalated / total) * 100;
  }

  // ===========================================================================
  // REFRAMING PERMISSION TRACKING
  // ===========================================================================

  static recordReframingRequest(): void {
    this.reframingMetrics.totalRequests++;
  }

  static recordReframingDecline(): void {
    this.reframingMetrics.declines++;
    this.updateReframingRate();
  }

  static recordReframingAccept(): void {
    this.reframingMetrics.accepts++;
    this.updateReframingRate();
  }

  private static updateReframingRate(): void {
    const total = this.reframingMetrics.declines + this.reframingMetrics.accepts;
    if (total > 0) {
      this.reframingMetrics.declineRate = (this.reframingMetrics.declines / total) * 100;
    }
  }

  static getReframingMetrics(): ReframingMetrics {
    return { ...this.reframingMetrics };
  }

  // ===========================================================================
  // SYSTEM HEALTH TRACKING
  // ===========================================================================

  static recordSuccessfulResponse(distressLevel: DistressLevel): void {
    this.systemHealth.totalResponses++;
    this.systemHealth.successfulResponses++;
    this.updateSuccessRate();
  }

  static recordFailedResponse(): void {
    this.systemHealth.totalResponses++;
    this.systemHealth.failedResponses++;
    this.updateSuccessRate();
  }

  static recordSystemFailure(category: string): void {
    const existing = this.systemHealth.failures.find(f => f.category === category);
    if (existing) {
      existing.count++;
    } else {
      this.systemHealth.failures.push({ category, count: 1 });
    }
    this.recordFailedResponse();
  }

  private static updateSuccessRate(): void {
    if (this.systemHealth.totalResponses > 0) {
      this.systemHealth.successRate = 
        (this.systemHealth.successfulResponses / this.systemHealth.totalResponses) * 100;
    }
  }

  static getSystemHealth(): SystemHealthMetrics {
    return { ...this.systemHealth, failures: [...this.systemHealth.failures] };
  }

  // ===========================================================================
  // REPORTING & ANALYSIS
  // ===========================================================================

  static generateHealthReport(): {
    violations: ViolationMetrics[];
    distress: DistressMetrics[];
    crisis: CrisisMetrics;
    reframing: ReframingMetrics;
    systemHealth: SystemHealthMetrics;
    summary: {
      totalViolations: number;
      criticalViolations: number;
      crisisEscalationRate: number;
      reframingDeclineRate: number;
      systemSuccessRate: number;
    };
  } {
    const violations = this.getViolationMetrics();
    const criticalViolations = violations.reduce(
      (sum, v) => sum + v.severityBreakdown.critical, 
      0
    );

    return {
      violations,
      distress: Array.from(this.distressStates.values()),
      crisis: this.getCrisisMetrics(),
      reframing: this.getReframingMetrics(),
      systemHealth: this.getSystemHealth(),
      summary: {
        totalViolations: this.getTotalViolations(),
        criticalViolations,
        crisisEscalationRate: this.getCrisisEscalationRate(),
        reframingDeclineRate: this.reframingMetrics.declineRate,
        systemSuccessRate: this.systemHealth.successRate,
      },
    };
  }

  static getAlerts(): Array<{ severity: 'warning' | 'critical'; message: string }> {
    const alerts: Array<{ severity: 'warning' | 'critical'; message: string }> = [];

    // Check for critical violations
    const violations = this.getViolationMetrics();
    for (const violation of violations) {
      if (violation.severityBreakdown.critical > 0) {
        alerts.push({
          severity: 'critical',
          message: `${violation.category}: ${violation.severityBreakdown.critical} critical violation(s)`,
        });
      }
    }

    // Check crisis escalation rate
    const crisisRate = this.getCrisisEscalationRate();
    if (crisisRate > 20) {
      alerts.push({
        severity: 'warning',
        message: `High crisis escalation rate: ${crisisRate.toFixed(1)}%`,
      });
    }

    // Check system success rate
    if (this.systemHealth.successRate < 90) {
      alerts.push({
        severity: 'critical',
        message: `Low system success rate: ${this.systemHealth.successRate.toFixed(1)}%`,
      });
    }

    // Check reframing decline rate
    if (this.reframingMetrics.declineRate > 50 && this.reframingMetrics.totalRequests > 10) {
      alerts.push({
        severity: 'warning',
        message: `High reframing decline rate: ${this.reframingMetrics.declineRate.toFixed(1)}%`,
      });
    }

    return alerts;
  }

  // ===========================================================================
  // RESET & MAINTENANCE
  // ===========================================================================

  static resetAllMetrics(): void {
    this.violations.clear();
    this.distressStates.clear();
    this.distressTransitions = [];
    this.crisisMetrics = {
      totalEvents: 0,
      emergencyLevel: 0,
      urgentLevel: 0,
      watchLevel: 0,
    };
    this.reframingMetrics = {
      totalRequests: 0,
      declines: 0,
      accepts: 0,
      declineRate: 0,
    };
    this.systemHealth = {
      totalResponses: 0,
      successfulResponses: 0,
      failedResponses: 0,
      successRate: 100,
      failures: [],
    };
    this.currentDistressStart.clear();
  }

  static exportMetrics(): string {
    return JSON.stringify(this.generateHealthReport(), null, 2);
  }
}

// =============================================================================
// TELEMETRY MIDDLEWARE
// =============================================================================

export class TelemetryMiddleware {
  /**
   * Wrap function calls with automatic telemetry
   */
  static wrap<T extends (...args: any[]) => any>(
    fn: T,
    category: string
  ): (...args: Parameters<T>) => ReturnType<T> {
    return (...args: Parameters<T>): ReturnType<T> => {
      try {
        const result = fn(...args);
        
        // If it's a promise, handle async
        if (result instanceof Promise) {
          return result.catch((error) => {
            SafetyTelemetry.recordSystemFailure(category);
            throw error;
          }) as ReturnType<T>;
        }
        
        return result;
      } catch (error) {
        SafetyTelemetry.recordSystemFailure(category);
        throw error;
      }
    };
  }
}
