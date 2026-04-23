/**
 * HTML Reporter - Generate visual HTML reports for telemetry data
 */

import type { TelemetryReport } from './types';

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format duration to human readable string
 */
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}m ${seconds}s`;
}

/**
 * Get status badge HTML
 */
function getStatusBadge(success: boolean): string {
  return success
    ? '<span class="badge badge-success">✓ Success</span>'
    : '<span class="badge badge-error">✗ Failed</span>';
}

/**
 * Generate bar chart HTML for phase durations
 */
function generatePhaseChart(spans: TelemetryReport['spans']): string {
  const validSpans = spans.filter((s) => s.duration && s.duration > 0);
  if (validSpans.length === 0) return '<p>No phase data available</p>';

  const maxDuration = Math.max(...validSpans.map((s) => s.duration || 0));
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  const bars = validSpans
    .map((span, index) => {
      const width = ((span.duration || 0) / maxDuration) * 100;
      const color = colors[index % colors.length];
      return `
        <div class="bar-container">
          <div class="bar-label" title="${span.name}">${span.name}</div>
          <div class="bar-wrapper">
            <div class="bar" style="width: ${width}%; background-color: ${color}"></div>
          </div>
          <div class="bar-value">${formatDuration(span.duration || 0)}</div>
        </div>
      `;
    })
    .join('');

  return `<div class="chart">${bars}</div>`;
}

/**
 * Generate timeline HTML for spans
 */
function generateTimeline(spans: TelemetryReport['spans']): string {
  if (spans.length === 0) return '<p>No timeline data available</p>';

  const sortedSpans = [...spans].sort((a, b) => a.startTime - b.startTime);
  const minTime = sortedSpans[0]?.startTime || 0;
  const maxTime = Math.max(...sortedSpans.map((s) => s.endTime || s.startTime));
  const totalDuration = maxTime - minTime;

  const timelineItems = sortedSpans
    .map((span) => {
      const start = ((span.startTime - minTime) / totalDuration) * 100;
      const width = ((span.duration || 0) / totalDuration) * 100;
      const statusClass = span.status === 'completed' ? 'completed' : span.status === 'error' ? 'error' : 'running';

      return `
        <div class="timeline-item">
          <div class="timeline-label">${span.name}</div>
          <div class="timeline-bar-wrapper">
            <div class="timeline-bar ${statusClass}" style="margin-left: ${start}%; width: ${Math.max(width, 0.5)}%"></div>
          </div>
          <div class="timeline-duration">${formatDuration(span.duration || 0)}</div>
        </div>
      `;
    })
    .join('');

  return `<div class="timeline">${timelineItems}</div>`;
}

/**
 * Generate memory usage chart
 */
function generateMemoryChart(report: TelemetryReport): string {
  const heapUsed = report.summary.totalMemoryDelta.heapUsed;
  const rss = report.summary.totalMemoryDelta.rss;

  const maxMemory = Math.max(Math.abs(heapUsed), Math.abs(rss), 1);
  const heapWidth = (Math.abs(heapUsed) / maxMemory) * 100;
  const rssWidth = (Math.abs(rss) / maxMemory) * 100;

  return `
    <div class="memory-chart">
      <div class="memory-item">
        <div class="memory-label">Heap Used</div>
        <div class="memory-bar-wrapper">
          <div class="memory-bar heap" style="width: ${heapWidth}%"></div>
        </div>
        <div class="memory-value ${heapUsed < 0 ? 'negative' : ''}">${heapUsed < 0 ? '-' : '+'}${formatBytes(Math.abs(heapUsed))}</div>
      </div>
      <div class="memory-item">
        <div class="memory-label">RSS</div>
        <div class="memory-bar-wrapper">
          <div class="memory-bar rss" style="width: ${rssWidth}%"></div>
        </div>
        <div class="memory-value ${rss < 0 ? 'negative' : ''}">${rss < 0 ? '-' : '+'}${formatBytes(Math.abs(rss))}</div>
      </div>
    </div>
  `;
}

/**
 * Generate spans table HTML
 */
function generateSpansTable(spans: TelemetryReport['spans']): string {
  if (spans.length === 0) return '<p>No span data available</p>';

  const rows = spans
    .map((span) => {
      const memoryBefore = span.memoryBefore ? formatBytes(span.memoryBefore.heapUsed) : '-';
      const memoryAfter = span.memoryAfter ? formatBytes(span.memoryAfter.heapUsed) : '-';
      const statusBadge =
        span.status === 'completed'
          ? '<span class="badge badge-success">Completed</span>'
          : span.status === 'error'
            ? '<span class="badge badge-error">Error</span>'
            : '<span class="badge badge-running">Running</span>';

      return `
        <tr>
          <td><code>${span.name}</code></td>
          <td>${formatDuration(span.duration || 0)}</td>
          <td>${memoryBefore}</td>
          <td>${memoryAfter}</td>
          <td>${statusBadge}</td>
        </tr>
      `;
    })
    .join('');

  return `
    <table class="spans-table">
      <thead>
        <tr>
          <th>Phase</th>
          <th>Duration</th>
          <th>Memory Before</th>
          <th>Memory After</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

/**
 * Generate complete HTML report
 */
export function generateHTMLReport(report: TelemetryReport): string {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Build Telemetry Report</title>
  <style>
    :root {
      --bg-color: #0f172a;
      --card-bg: #1e293b;
      --text-color: #f1f5f9;
      --text-muted: #94a3b8;
      --border-color: #334155;
      --accent-color: #3b82f6;
      --success-color: #10b981;
      --error-color: #ef4444;
      --warning-color: #f59e0b;
    }

    @media (prefers-color-scheme: light) {
      :root {
        --bg-color: #f8fafc;
        --card-bg: #ffffff;
        --text-color: #1e293b;
        --text-muted: #64748b;
        --border-color: #e2e8f0;
      }
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background-color: var(--bg-color);
      color: var(--text-color);
      line-height: 1.6;
      padding: 2rem;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    header {
      text-align: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border-color);
    }

    h1 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      color: var(--text-muted);
      font-size: 0.9rem;
    }

    .card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .card h2 {
      font-size: 1.25rem;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--border-color);
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .stat-card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 1rem;
    }

    .stat-label {
      color: var(--text-muted);
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 600;
      margin-top: 0.25rem;
    }

    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .badge-success {
      background: rgba(16, 185, 129, 0.2);
      color: var(--success-color);
    }

    .badge-error {
      background: rgba(239, 68, 68, 0.2);
      color: var(--error-color);
    }

    .badge-running {
      background: rgba(245, 158, 11, 0.2);
      color: var(--warning-color);
    }

    .chart {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .bar-container {
      display: grid;
      grid-template-columns: 1fr 2fr 100px;
      align-items: center;
      gap: 1rem;
    }

    .bar-label {
      font-size: 0.85rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .bar-wrapper {
      background: var(--border-color);
      border-radius: 4px;
      height: 24px;
      overflow: hidden;
    }

    .bar {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .bar-value {
      text-align: right;
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .timeline {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .timeline-item {
      display: grid;
      grid-template-columns: 1fr 3fr 100px;
      align-items: center;
      gap: 1rem;
    }

    .timeline-label {
      font-size: 0.85rem;
    }

    .timeline-bar-wrapper {
      background: var(--border-color);
      border-radius: 4px;
      height: 12px;
      position: relative;
    }

    .timeline-bar {
      position: absolute;
      height: 100%;
      border-radius: 4px;
      min-width: 2px;
    }

    .timeline-bar.completed {
      background: var(--success-color);
    }

    .timeline-bar.error {
      background: var(--error-color);
    }

    .timeline-bar.running {
      background: var(--warning-color);
    }

    .timeline-duration {
      text-align: right;
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .memory-chart {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .memory-item {
      display: grid;
      grid-template-columns: 120px 1fr 100px;
      align-items: center;
      gap: 1rem;
    }

    .memory-label {
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .memory-bar-wrapper {
      background: var(--border-color);
      border-radius: 4px;
      height: 20px;
      overflow: hidden;
    }

    .memory-bar {
      height: 100%;
      border-radius: 4px;
    }

    .memory-bar.heap {
      background: var(--accent-color);
    }

    .memory-bar.rss {
      background: var(--success-color);
    }

    .memory-value {
      font-size: 0.85rem;
      text-align: right;
    }

    .memory-value.negative {
      color: var(--error-color);
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      text-align: left;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--border-color);
    }

    th {
      background: var(--bg-color);
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.5px;
      color: var(--text-muted);
    }

    td {
      font-size: 0.9rem;
    }

    code {
      background: var(--bg-color);
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      font-family: 'Fira Code', 'Monaco', monospace;
      font-size: 0.85rem;
    }

    .config-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .config-item {
      padding: 0.75rem;
      background: var(--bg-color);
      border-radius: 4px;
    }

    .config-key {
      font-size: 0.75rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .config-value {
      font-size: 0.95rem;
      margin-top: 0.25rem;
    }

    .error-message {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid var(--error-color);
      border-radius: 8px;
      padding: 1rem;
      margin-top: 1rem;
    }

    .error-message h3 {
      color: var(--error-color);
      margin-bottom: 0.5rem;
    }

    footer {
      text-align: center;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border-color);
      color: var(--text-muted);
      font-size: 0.85rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🚀 Build Telemetry Report</h1>
      <p class="subtitle">Generated on ${new Date(report.timestamp).toLocaleString()}</p>
    </header>

    <section class="card">
      <h2>📊 Overview</h2>
      <div class="grid">
        <div class="stat-card">
          <div class="stat-label">Status</div>
          <div class="stat-value">${getStatusBadge(report.summary.success)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Duration</div>
          <div class="stat-value">${formatDuration(report.summary.totalDuration)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Phases</div>
          <div class="stat-value">${report.spans.length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Memory Delta</div>
          <div class="stat-value">${formatBytes(Math.abs(report.summary.totalMemoryDelta.heapUsed))}</div>
        </div>
      </div>
      ${report.summary.errorMessage ? `<div class="error-message"><h3>Error</h3><pre>${report.summary.errorMessage}</pre></div>` : ''}
    </section>

    <section class="card">
      <h2>⚙️ Build Configuration</h2>
      <div class="config-grid">
        <div class="config-item">
          <div class="config-key">Bundler</div>
          <div class="config-value">${report.bundler}</div>
        </div>
        <div class="config-item">
          <div class="config-key">Preset</div>
          <div class="config-value">${report.preset}</div>
        </div>
        <div class="config-item">
          <div class="config-key">Mode</div>
          <div class="config-value">${report.production ? 'Production' : 'Development'}</div>
        </div>
        <div class="config-item">
          <div class="config-key">Node.js</div>
          <div class="config-value">${report.nodeVersion}</div>
        </div>
        <div class="config-item">
          <div class="config-key">Platform</div>
          <div class="config-value">${report.platform} (${report.arch})</div>
        </div>
        <div class="config-item">
          <div class="config-key">Bundler Version</div>
          <div class="config-value">${report.bundlerVersion}</div>
        </div>
      </div>
    </section>

    <section class="card">
      <h2>💻 System Info</h2>
      <div class="config-grid">
        <div class="config-item">
          <div class="config-key">CPUs</div>
          <div class="config-value">${report.systemInfo.cpus || 'N/A'}</div>
        </div>
        <div class="config-item">
          <div class="config-key">Total Memory</div>
          <div class="config-value">${formatBytes(report.systemInfo.totalMemory)}</div>
        </div>
        <div class="config-item">
          <div class="config-key">Free Memory</div>
          <div class="config-value">${formatBytes(report.systemInfo.freeMemory)}</div>
        </div>
        <div class="config-item">
          <div class="config-key">Architecture</div>
          <div class="config-value">${report.systemInfo.arch}</div>
        </div>
      </div>
    </section>

    <section class="card">
      <h2>📈 Phase Duration Chart</h2>
      ${generatePhaseChart(report.spans)}
    </section>

    <section class="card">
      <h2>⏱️ Timeline</h2>
      ${generateTimeline(report.spans)}
    </section>

    <section class="card">
      <h2>💾 Memory Usage</h2>
      ${generateMemoryChart(report)}
    </section>

    <section class="card">
      <h2>📋 Detailed Phases</h2>
      ${generateSpansTable(report.spans)}
    </section>

    <footer>
      <p>Generated by @aziontech/bundler-telemetry</p>
    </footer>
  </div>
</body>
</html>`;

  return html;
}

/**
 * Save the HTML report to a file
 */
export async function saveHTMLReport(report: TelemetryReport, outputPath: string): Promise<void> {
  // Dynamic import for fs/path to support browser-like environments
  const fs = await import('fs');
  const path = await import('path');

  const dir = path.dirname(outputPath);
  await fs.promises.mkdir(dir, { recursive: true });

  const html = generateHTMLReport(report);
  await fs.promises.writeFile(outputPath, html, 'utf-8');
}
