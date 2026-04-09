/**
 * Telemetry Collector - Main class for collecting build telemetry
 */

import * as os from 'os';

import { formatSummary } from './console';
import { saveHTMLReport } from './html-reporter';
import { generateReport, saveReport } from './reporter';
import type {
  TelemetryBuildMetadata,
  TelemetryConfig,
  TelemetryReport,
  TelemetrySpan,
  TelemetrySystemInfo,
} from './types';

/**
 * Main telemetry collector class for tracking build performance
 */
export class TelemetryCollector {
  private config: TelemetryConfig;
  private spans: Map<string, TelemetrySpan> = new Map();
  private rootSpanId: string | null = null;
  private metadata: TelemetryBuildMetadata;
  private startTime: number;
  private startMemory: NodeJS.MemoryUsage;
  private endMemory: NodeJS.MemoryUsage | null = null;
  private buildSuccess: boolean = true;
  private errorMessage: string | undefined;

  /**
   * Create a new TelemetryCollector instance
   */
  constructor(config: TelemetryConfig, metadata: TelemetryBuildMetadata) {
    this.config = config;
    this.metadata = metadata;
    this.startTime = performance.now();
    this.startMemory = process.memoryUsage();
    // Note: Header and build config logging is handled by the caller (build.ts)
    // to avoid duplication with runPhaseWithTelemetry
  }

  /**
   * Start a new span for tracking a phase or operation
   * @param name - Name of the span
   * @param attributes - Optional attributes/metadata for the span
   * @param parentId - Optional parent span ID for nested spans
   * @returns The ID of the created span
   */
  startSpan(name: string, attributes?: Record<string, unknown>, parentId?: string): string {
    if (!this.config.enabled) {
      return '';
    }

    const id = this.generateSpanId();
    const span: TelemetrySpan = {
      id,
      name,
      parentId: parentId ?? this.rootSpanId ?? undefined,
      startTime: performance.now(),
      memoryBefore: process.memoryUsage(),
      attributes: attributes ?? {},
      status: 'running',
    };

    if (!this.rootSpanId) {
      this.rootSpanId = id;
    }

    this.spans.set(id, span);
    return id;
  }

  /**
   * End a span and record its final state
   * @param spanId - The ID of the span to end
   * @param error - Optional error message if the span failed
   */
  endSpan(spanId: string, error?: string): void {
    if (!this.config.enabled || !spanId) {
      return;
    }

    const span = this.spans.get(spanId);
    if (!span) {
      return;
    }

    span.endTime = performance.now();
    span.duration = span.endTime - span.startTime;
    span.memoryAfter = process.memoryUsage();
    span.status = error ? 'error' : 'completed';
    span.errorMessage = error;
    // Note: Console logging is handled by runPhaseWithTelemetry to avoid duplication
  }

  /**
   * Measure an async function execution
   * @param name - Name for the span
   * @param fn - Async function to measure
   * @param attributes - Optional attributes for the span
   * @returns The result of the async function
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>, attributes?: Record<string, unknown>): Promise<T> {
    if (!this.config.enabled) {
      return fn();
    }

    const spanId = this.startSpan(name, attributes);
    try {
      const result = await fn();
      this.endSpan(spanId);
      return result;
    } catch (error) {
      this.endSpan(spanId, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Measure a sync function execution
   * @param name - Name for the span
   * @param fn - Sync function to measure
   * @param attributes - Optional attributes for the span
   * @returns The result of the sync function
   */
  measureSync<T>(name: string, fn: () => T, attributes?: Record<string, unknown>): T {
    if (!this.config.enabled) {
      return fn();
    }

    const spanId = this.startSpan(name, attributes);
    try {
      const result = fn();
      this.endSpan(spanId);
      return result;
    } catch (error) {
      this.endSpan(spanId, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Mark the build as failed with an error message
   * @param error - Error message
   */
  markFailed(error: string): void {
    this.buildSuccess = false;
    this.errorMessage = error;
  }

  /**
   * Set additional attributes on an existing span
   * @param spanId - The span ID
   * @param attributes - Attributes to merge
   */
  setSpanAttributes(spanId: string, attributes: Record<string, unknown>): void {
    if (!this.config.enabled || !spanId) {
      return;
    }

    const span = this.spans.get(spanId);
    if (span) {
      span.attributes = { ...span.attributes, ...attributes };
    }
  }

  /**
   * Get the current span by ID
   * @param spanId - The span ID
   * @returns The span or undefined
   */
  getSpan(spanId: string): TelemetrySpan | undefined {
    return this.spans.get(spanId);
  }

  /**
   * Get all spans
   * @returns Array of all spans
   */
  getAllSpans(): TelemetrySpan[] {
    return Array.from(this.spans.values());
  }

  /**
   * Get spans that have a specific parent
   * @param parentId - Parent span ID
   * @returns Array of child spans
   */
  getChildSpans(parentId: string): TelemetrySpan[] {
    return this.getAllSpans().filter((span) => span.parentId === parentId);
  }

  /**
   * Finalize the telemetry collection and generate report
   */
  finalize(): TelemetryReport {
    this.endMemory = process.memoryUsage();
    const report = generateReport(this, this.metadata);
    return report;
  }

  /**
   * Print the telemetry summary to console
   */
  printToConsole(): void {
    if (!this.config.enabled || this.config.outputFormat === 'json') {
      return;
    }

    const report = this.finalize();
    console.log(formatSummary(report));
  }

  /**
   * Save the telemetry report to a JSON file and optionally HTML
   * @param jsonPath - Optional path override for JSON (uses config path if not provided)
   * @param htmlPath - Optional path override for HTML (uses config htmlOutputPath if not provided)
   */
  async saveReport(jsonPath?: string, htmlPath?: string): Promise<void> {
    if (!this.config.enabled || this.config.outputFormat === 'console') {
      return;
    }

    const report = this.finalize();
    const outputJsonPath = jsonPath ?? this.config.outputPath;

    // Save JSON report
    await saveReport(report, outputJsonPath);

    // Determine HTML path
    const outputHtmlPath = htmlPath ?? this.config.htmlOutputPath ?? outputJsonPath.replace(/\.json$/, '.html');

    // Save HTML report
    if (this.config.outputFormat === 'html' || this.config.outputFormat === 'both') {
      await saveHTMLReport(report, outputHtmlPath);
      console.log(`📄 Telemetry reports saved:\n   JSON: ${outputJsonPath}\n   HTML: ${outputHtmlPath}\n`);
    } else if (this.config.outputFormat === 'json') {
      console.log(`📄 Telemetry report saved to ${outputJsonPath}\n`);
    }
  }

  /**
   * Get the system information
   */
  getSystemInfo(): TelemetrySystemInfo {
    try {
      return {
        cpus: os.cpus?.()?.length ?? 0,
        totalMemory: os.totalmem?.() ?? 0,
        freeMemory: os.freemem?.() ?? 0,
        platform: os.platform?.() ?? 'unknown',
        arch: os.arch?.() ?? 'unknown',
      };
    } catch {
      return {
        cpus: 0,
        totalMemory: 0,
        freeMemory: 0,
        platform: 'unknown',
        arch: 'unknown',
      };
    }
  }

  /**
   * Get the start time of the build
   */
  getStartTime(): number {
    return this.startTime;
  }

  /**
   * Get the total duration of the build
   */
  getTotalDuration(): number {
    return performance.now() - this.startTime;
  }

  /**
   * Get the memory delta (current - start)
   */
  getMemoryDelta(): { heapUsed: number; rss: number } {
    const currentMemory = this.endMemory ?? process.memoryUsage();
    return {
      heapUsed: currentMemory.heapUsed - this.startMemory.heapUsed,
      rss: currentMemory.rss - this.startMemory.rss,
    };
  }

  /**
   * Get the build success status
   */
  getBuildSuccess(): boolean {
    return this.buildSuccess;
  }

  /**
   * Get the error message if build failed
   */
  getErrorMessage(): string | undefined {
    return this.errorMessage;
  }

  /**
   * Generate a unique span ID
   */
  private generateSpanId(): string {
    return `span_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}
