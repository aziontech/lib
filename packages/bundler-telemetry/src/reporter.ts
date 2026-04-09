/**
 * Reporter module for generating and saving telemetry reports
 */

import * as fs from 'fs';
import * as path from 'path';

import type { TelemetryCollector } from './collector';
import { formatPhaseComplete, formatPhaseStart } from './console';
import type {
  ReportOptions,
  TelemetryBuildMetadata,
  TelemetryOutputFormat,
  TelemetryPluginMetrics,
  TelemetryReport,
} from './types';

/**
 * Get the current package version from package.json
 */
function getPackageVersion(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pkg = require('../package.json');
    return pkg.version || '0.0.0';
  } catch {
    return '0.0.0';
  }
}

/**
 * Generate a telemetry report from the collector data
 */
export function generateReport(collector: TelemetryCollector, metadata: TelemetryBuildMetadata): TelemetryReport {
  const spans = collector.getAllSpans();
  const memoryDelta = collector.getMemoryDelta();

  const report: TelemetryReport = {
    bundlerVersion: metadata.bundlerVersion || getPackageVersion(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    timestamp: new Date().toISOString(),
    preset: metadata.preset,
    bundler: metadata.bundler,
    production: metadata.production,
    entry: metadata.entry,
    systemInfo: collector.getSystemInfo(),
    spans: spans,
    summary: {
      totalDuration: collector.getTotalDuration(),
      totalMemoryDelta: memoryDelta,
      success: collector.getBuildSuccess(),
      errorMessage: collector.getErrorMessage(),
    },
  };

  return report;
}

/**
 * Extract plugin metrics from spans
 */
export function extractPluginMetrics(spans: TelemetryReport['spans']): TelemetryPluginMetrics[] {
  const pluginSpans = spans.filter((span) => span.name.startsWith('plugin:') || span.name.includes('-plugin'));

  return pluginSpans.map((span) => ({
    name: span.name.replace(/^plugin:/, ''),
    duration: span.duration || 0,
    filesProcessed: span.attributes?.filesProcessed as number | undefined,
  }));
}

/**
 * Convert report to JSON string
 */
export function reportToJSON(report: TelemetryReport, options?: ReportOptions): string {
  const includeAllSpans = options?.includeAllSpans ?? true;
  const prettyPrint = options?.prettyPrint ?? true;

  let spans = report.spans;
  if (!includeAllSpans) {
    // Only include top-level spans (no parent)
    spans = spans.filter((span) => !span.parentId);
  }

  // Convert memory usage values to serializable format
  const serializedReport = serializeReport({ ...report, spans });

  return prettyPrint ? JSON.stringify(serializedReport, null, 2) : JSON.stringify(serializedReport);
}

/**
 * Serialized telemetry report for JSON output
 */
interface SerializedTelemetryReport extends Omit<TelemetryReport, 'spans'> {
  spans: Array<
    Omit<TelemetryReport['spans'][number], 'memoryBefore' | 'memoryAfter'> & {
      memoryBefore?: Record<string, number>;
      memoryAfter?: Record<string, number>;
    }
  >;
}

/**
 * Serialize memory usage values in the report for JSON output
 */
function serializeReport(report: TelemetryReport): SerializedTelemetryReport {
  const serialized = JSON.parse(JSON.stringify(report)) as TelemetryReport;

  // Serialize memory usage in spans
  const spans = serialized.spans.map((span) => ({
    ...span,
    memoryBefore: span.memoryBefore ? serializeMemoryUsage(span.memoryBefore) : undefined,
    memoryAfter: span.memoryAfter ? serializeMemoryUsage(span.memoryAfter) : undefined,
  }));

  return { ...serialized, spans } as SerializedTelemetryReport;
}

/**
 * Serialize NodeJS.MemoryUsage to a plain object
 */
function serializeMemoryUsage(memory: NodeJS.MemoryUsage): Record<string, number> {
  return {
    rss: memory.rss,
    heapTotal: memory.heapTotal,
    heapUsed: memory.heapUsed,
    external: memory.external,
    arrayBuffers: memory.arrayBuffers,
  };
}

/**
 * Save the telemetry report to a JSON file
 */
export async function saveReport(report: TelemetryReport, outputPath: string): Promise<void> {
  const dir = path.dirname(outputPath);

  // Ensure the directory exists
  await fs.promises.mkdir(dir, { recursive: true });

  // Write the report
  const jsonContent = reportToJSON(report);
  await fs.promises.writeFile(outputPath, jsonContent, 'utf-8');
}

/**
 * Load a telemetry report from a JSON file
 */
export async function loadReport(inputPath: string): Promise<TelemetryReport> {
  const content = await fs.promises.readFile(inputPath, 'utf-8');
  return JSON.parse(content) as TelemetryReport;
}

/**
 * Create a summary report (subset of full report for quick viewing)
 */
export function createSummaryReport(report: TelemetryReport): {
  bundlerVersion: string;
  preset: string;
  bundler: string;
  production: boolean;
  totalDuration: number;
  success: boolean;
  phaseCount: number;
  errorMessage?: string;
} {
  return {
    bundlerVersion: report.bundlerVersion,
    preset: report.preset,
    bundler: report.bundler,
    production: report.production,
    totalDuration: report.summary.totalDuration,
    success: report.summary.success,
    phaseCount: report.spans.length,
    errorMessage: report.summary.errorMessage,
  };
}

/**
 * Compare two telemetry reports and return the differences
 */
export function compareReports(
  report1: TelemetryReport,
  report2: TelemetryReport,
): {
  durationDelta: number;
  memoryDelta: { heapUsed: number; rss: number };
  phaseDiffs: Array<{ name: string; durationDelta: number }>;
} {
  // Duration difference
  const durationDelta = report2.summary.totalDuration - report1.summary.totalDuration;

  // Memory difference
  const memoryDelta = {
    heapUsed: report2.summary.totalMemoryDelta.heapUsed - report1.summary.totalMemoryDelta.heapUsed,
    rss: report2.summary.totalMemoryDelta.rss - report1.summary.totalMemoryDelta.rss,
  };

  // Phase by phase comparison
  const phaseDiffs: Array<{ name: string; durationDelta: number }> = [];

  for (const span2 of report2.spans) {
    const span1 = report1.spans.find((s) => s.name === span2.name);
    if (span1 && span1.duration && span2.duration) {
      phaseDiffs.push({
        name: span2.name,
        durationDelta: span2.duration - span1.duration,
      });
    }
  }

  return {
    durationDelta,
    memoryDelta,
    phaseDiffs,
  };
}

export const runPhaseWithTelemetry = async <T>(
  telemetry: TelemetryCollector,
  telemetryEnabled: boolean,
  outputFormat: TelemetryOutputFormat,
  phaseName: string,
  displayName: string,
  fn: () => Promise<T>,
): Promise<T> => {
  const spanId = telemetry.startSpan(phaseName);
  if (telemetryEnabled && outputFormat !== 'json' && outputFormat !== 'html') {
    console.log(
      formatPhaseStart({
        id: spanId,
        name: displayName,
        attributes: {},
        status: 'running',
        startTime: Date.now(),
      }),
    );
  }
  try {
    const result = await fn();
    telemetry.endSpan(spanId);
    if (telemetryEnabled && outputFormat !== 'json' && outputFormat !== 'html') {
      const span = telemetry.getSpan(spanId);
      if (span) console.log(formatPhaseComplete(span));
    }
    return result;
  } catch (error) {
    telemetry.endSpan(spanId);
    throw error;
  }
};
