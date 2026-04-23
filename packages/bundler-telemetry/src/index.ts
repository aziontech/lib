/**
 * @aziontech/bundler-telemetry
 *
 * Telemetry system for measuring and reporting build performance in Azion Bundler
 */

// Main class
export { TelemetryCollector } from './collector';

// Types
export type {
  ConsoleFormatters,
  ReportOptions,
  SpanTreeNode,
  TelemetryBuildMetadata,
  TelemetryConfig,
  TelemetryOutputFormat,
  TelemetryPhaseMetrics,
  TelemetryPluginMetrics,
  TelemetryReport,
  TelemetrySpan,
  TelemetrySystemInfo,
} from './types';

// Console formatters
export {
  formatBuildConfig,
  formatBytes,
  formatDuration,
  formatHeader,
  formatInfo,
  formatPhaseComplete,
  formatPhaseError,
  formatPhaseStart,
  formatSpansTree,
  formatSummary,
  formatWarning,
  getConsoleFormatters,
} from './console';

// Report utilities
export {
  compareReports,
  createSummaryReport,
  extractPluginMetrics,
  generateReport,
  loadReport,
  reportToJSON,
  runPhaseWithTelemetry,
  saveReport,
} from './reporter';

// HTML Reporter
export { generateHTMLReport, saveHTMLReport } from './html-reporter';
