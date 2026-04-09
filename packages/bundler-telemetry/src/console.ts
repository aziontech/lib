/**
 * Console output formatters for telemetry display
 */

import type { ConsoleFormatters, TelemetryBuildMetadata, TelemetryReport, TelemetrySpan } from './types';

/**
 * ANSI color codes for terminal output
 */
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

/**
 * Symbols for visual indicators
 */
const symbols = {
  check: '✓',
  hourglass: '⏳',
  warning: '⚠️',
  error: '❌',
  info: 'ℹ️',
  package: '📦',
  chart: '📊',
  gear: '⚙️',
  lightning: '⚡',
};

/**
 * Format a duration in milliseconds to a human-readable string
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  }
  if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.round((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (Math.abs(bytes) < 1024) {
    return `${bytes}B`;
  }
  if (Math.abs(bytes) < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)}KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

/**
 * Format the header/banner for the build
 */
export function formatHeader(bundlerVersion: string): string {
  return `
${colors.bright}${colors.magenta}${symbols.lightning} Azion Bundler ${colors.cyan}v${bundlerVersion}${colors.reset}`;
}

/**
 * Format the build configuration display
 */
export function formatBuildConfig(metadata: TelemetryBuildMetadata): string {
  const mode = metadata.production
    ? `${colors.red}production${colors.reset}`
    : `${colors.cyan}development${colors.reset}`;
  return `
${colors.bright}${symbols.package} Build Configuration${colors.reset}
   Preset: ${colors.cyan}${metadata.preset}${colors.reset}
   Bundler: ${colors.cyan}${metadata.bundler}${colors.reset}
   Mode: ${mode}`;
}

/**
 * Format a span when it starts (for real-time display)
 */
export function formatPhaseStart(span: TelemetrySpan): string {
  return `${colors.dim}${symbols.hourglass} ${span.name}...${colors.reset}`;
}

/**
 * Format a span when it completes
 */
export function formatPhaseComplete(span: TelemetrySpan): string {
  if (span.status === 'error') {
    return `${colors.red}${symbols.error} ${span.name}${colors.reset} ${colors.red}FAILED: ${span.errorMessage}${colors.reset}`;
  }

  const duration = span.duration ? formatDuration(span.duration) : 'N/A';
  let warning = '';

  // Show warning if this phase took more than 1 second and represents > 30% of total build
  if (span.duration && span.duration > 1000) {
    warning = ` ${colors.yellow}${symbols.warning}${colors.reset} ${colors.dim}(${colors.yellow}slow phase${colors.dim})${colors.reset}`;
  }

  // Check if we have children to show
  const indent = span.parentId ? '   ' : '';

  if (span.status === 'completed') {
    return `${colors.green}${symbols.check}${colors.reset} ${indent}${span.name.padEnd(25)} ${colors.cyan}${duration}${colors.reset}${warning}`;
  }

  return `${indent}${span.name.padEnd(25)} ${duration}`;
}

/**
 * Format a span error
 */
export function formatPhaseError(span: TelemetrySpan): string {
  return `${colors.red}${symbols.error} ${span.name}${colors.reset} - ${span.errorMessage || 'Unknown error'}`;
}

/**
 * Format the build summary
 */
export function formatSummary(report: TelemetryReport): string {
  const success = report.summary.success;
  const statusText = success ? `${colors.green}Success${colors.reset}` : `${colors.red}Failed${colors.reset}`;

  const memoryDelta = report.summary.totalMemoryDelta;
  const heapSign = memoryDelta.heapUsed >= 0 ? '+' : '';
  const rssSign = memoryDelta.rss >= 0 ? '+' : '';

  let summary = `
${colors.bright}${symbols.chart} Build Summary${colors.reset}
   Status: ${statusText}
   Total Duration: ${colors.cyan}${formatDuration(report.summary.totalDuration)}${colors.reset}
   Memory Delta: ${colors.dim}${heapSign}${formatBytes(memoryDelta.heapUsed)} heap, ${rssSign}${formatBytes(memoryDelta.rss)} RSS${colors.reset}`;

  if (report.summary.bundleSize) {
    summary += `\n   Bundle Size: ${colors.cyan}${formatBytes(report.summary.bundleSize)}${colors.reset}`;
  }

  if (report.summary.modulesCount) {
    summary += `\n   Modules: ${colors.cyan}${report.summary.modulesCount}${colors.reset}`;
  }

  if (report.summary.errorMessage) {
    summary += `\n\n${colors.red}Error: ${report.summary.errorMessage}${colors.reset}`;
  }

  return summary;
}

/**
 * Format a warning message
 */
export function formatWarning(message: string): string {
  return `${colors.yellow}${symbols.warning} Warning:${colors.reset} ${message}`;
}

/**
 * Format an info message
 */
export function formatInfo(message: string): string {
  return `${colors.cyan}${symbols.info}${colors.reset} ${message}`;
}

/**
 * Format a hierarchical view of spans
 */
export function formatSpansTree(spans: TelemetrySpan[], indent: number = 0): string {
  const lines: string[] = [];

  // Get root spans (no parent)
  const rootSpans = spans.filter((s) => !s.parentId);

  function renderSpan(span: TelemetrySpan, depth: number) {
    const prefix = '  '.repeat(depth);
    const duration = span.duration ? formatDuration(span.duration) : 'N/A';
    const status =
      span.status === 'completed'
        ? `${colors.green}${symbols.check}${colors.reset}`
        : span.status === 'error'
          ? `${colors.red}${symbols.error}${colors.reset}`
          : `${colors.yellow}${symbols.hourglass}${colors.reset}`;

    lines.push(`${prefix}${status} ${span.name}: ${colors.cyan}${duration}${colors.reset}`);

    // Find children
    const children = spans.filter((s) => s.parentId === span.id);
    children.forEach((child) => renderSpan(child, depth + 1));
  }

  rootSpans.forEach((span) => renderSpan(span, indent));

  return lines.join('\n');
}

/**
 * Get all console formatters as an object
 */
export function getConsoleFormatters(): ConsoleFormatters {
  return {
    header: formatHeader,
    buildConfig: formatBuildConfig,
    phaseStart: formatPhaseStart,
    phaseComplete: formatPhaseComplete,
    phaseError: formatPhaseError,
    summary: formatSummary,
    warning: formatWarning,
    info: formatInfo,
  };
}
