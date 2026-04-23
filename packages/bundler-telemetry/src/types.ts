/**
 * Telemetry types for @aziontech/bundler-telemetry
 */

/**
 * Configuration for the telemetry collector
 */
export interface TelemetryConfig {
  /** Enable or disable telemetry collection */
  enabled: boolean;
  /** Output format for telemetry data */
  outputFormat: TelemetryOutputFormat;
  /** Path to save the JSON report */
  outputPath: string;
  /** Path to save the HTML report (optional, defaults to same directory as JSON with .html extension) */
  htmlOutputPath?: string;
  /** OpenTelemetry integration options (optional) */
  openTelemetry?: {
    enabled: boolean;
    endpoint?: string;
    serviceName: string;
  };
}

export type TelemetryOutputFormat = 'console' | 'json' | 'both' | 'html';

/**
 * Represents a single span of telemetry data
 */
export interface TelemetrySpan {
  /** Unique identifier for the span */
  id: string;
  /** Name of the span */
  name: string;
  /** Parent span ID (for nested spans) */
  parentId?: string;
  /** Start time in milliseconds (from performance.now()) */
  startTime: number;
  /** End time in milliseconds (from performance.now()) */
  endTime?: number;
  /** Duration in milliseconds */
  duration?: number;
  /** Additional attributes/metadata for the span */
  attributes: Record<string, unknown>;
  /** Memory usage before the span started */
  memoryBefore?: NodeJS.MemoryUsage;
  /** Memory usage after the span ended */
  memoryAfter?: NodeJS.MemoryUsage;
  /** Status of the span */
  status: 'running' | 'completed' | 'error';
  /** Error message if status is 'error' */
  errorMessage?: string;
}

/**
 * Metrics for a build phase
 */
export interface TelemetryPhaseMetrics {
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  memoryBefore: NodeJS.MemoryUsage;
  memoryAfter: NodeJS.MemoryUsage;
  metadata?: Record<string, unknown>;
}

/**
 * Metrics for a plugin execution
 */
export interface TelemetryPluginMetrics {
  name: string;
  duration: number;
  filesProcessed?: number;
}

/**
 * System information collected at build start
 */
export interface TelemetrySystemInfo {
  cpus: number;
  totalMemory: number;
  freeMemory: number;
  platform: string;
  arch: string;
}

/**
 * Complete telemetry report for a build
 */
export interface TelemetryReport {
  /** Version of the bundler */
  bundlerVersion: string;
  /** Node.js version */
  nodeVersion: string;
  /** Platform (darwin, linux, win32, etc.) */
  platform: string;
  /** Architecture (x64, arm64, etc.) */
  arch: string;
  /** ISO timestamp of the build */
  timestamp: string;
  /** Preset used (nextjs, react, etc.) */
  preset: string;
  /** Bundler used (esbuild or webpack) */
  bundler: 'esbuild' | 'webpack';
  /** Whether this was a production build */
  production: boolean;
  /** Entry point(s) for the build */
  entry: string | string[];
  /** System information */
  systemInfo: TelemetrySystemInfo;
  /** All spans recorded during the build */
  spans: TelemetrySpan[];
  /** Plugin metrics (if any) */
  plugins?: TelemetryPluginMetrics[];
  /** Build summary */
  summary: {
    totalDuration: number;
    totalMemoryDelta: {
      heapUsed: number;
      rss: number;
    };
    bundleSize?: number;
    modulesCount?: number;
    success: boolean;
    errorMessage?: string;
  };
}

/**
 * Build metadata passed to the telemetry collector
 */
export interface TelemetryBuildMetadata {
  bundlerVersion: string;
  preset: string;
  bundler: 'esbuild' | 'webpack';
  production: boolean;
  entry: string | string[];
}

/**
 * Console formatter functions
 */
export interface ConsoleFormatters {
  phaseStart: (span: TelemetrySpan) => string;
  phaseComplete: (span: TelemetrySpan) => string;
  phaseError: (span: TelemetrySpan) => string;
  summary: (report: TelemetryReport) => string;
  warning: (message: string) => string;
  info: (message: string) => string;
  header: (bundlerVersion: string) => string;
  buildConfig: (metadata: TelemetryBuildMetadata) => string;
}

/**
 * Options for generating a report
 */
export interface ReportOptions {
  /** Include all spans or just top-level ones */
  includeAllSpans?: boolean;
  /** Pretty print JSON output */
  prettyPrint?: boolean;
}

/**
 * Span tree node for hierarchical display
 */
export interface SpanTreeNode {
  span: TelemetrySpan;
  children: SpanTreeNode[];
}
