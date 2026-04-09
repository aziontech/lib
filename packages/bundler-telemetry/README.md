# @aziontech/bundler-telemetry

> Telemetry system for measuring and reporting build performance in Azion Bundler

## Installation

```bash
npm install @aziontech/bundler-telemetry
# or
pnpm add @aziontech/bundler-telemetry
```

## Usage

### Basic Usage

```typescript
import { TelemetryCollector } from '@aziontech/bundler-telemetry';

const telemetry = new TelemetryCollector(
  {
    enabled: true,
    outputFormat: 'both',
    outputPath: '.edge/telemetry-report.json',
  },
  {
    bundlerVersion: '7.2.0',
    preset: 'nextjs',
    bundler: 'esbuild',
    production: true,
    entry: './src/main.ts',
  },
);

// Measure async operations
await telemetry.measureAsync('dependencies-check', async () => {
  await checkDependencies();
});

await telemetry.measureAsync('preset-resolution', async () => {
  return await resolvePreset(config.build?.preset);
});

// Or use manual span management
const buildSpanId = telemetry.startSpan('core-build', { bundler: 'esbuild' });
// ... perform build
telemetry.endSpan(buildSpanId);

// Generate output
telemetry.printToConsole();
await telemetry.saveReport();
```

### Output

When `outputFormat` is set to `'console'` or `'both'`, telemetry will display real-time progress:

```
⚡ Azion Bundler v7.2.0

📦 Build Configuration
   Preset: nextjs
   Bundler: esbuild
   Mode: production

⚙️  Starting build pipeline...

✓ Dependencies Check        45ms
✓ Preset Resolution         120ms
✓ Build Config Setup         80ms
✓ Environment Setup          30ms
✓ Prebuild                  250ms
✓ Handler Resolution         15ms
✓ Worker Setup              100ms
✓ Core Build                1.5s
✓ Postbuild                 180ms
✓ Storage Setup              60ms
✓ Bindings Setup             45ms
✓ Env Vars Copy              10ms

📊 Build Summary
   Status: Success
   Total Duration: 2.4s
   Memory Delta: +150MB heap, +200MB RSS
   Bundle Size: 512KB
   Modules: 150

📄 Telemetry report saved to .edge/telemetry-report.json
```

### JSON Report

The JSON report is saved to the specified `outputPath`:

```json
{
  "bundlerVersion": "7.2.0",
  "nodeVersion": "v18.20.0",
  "platform": "darwin",
  "arch": "x64",
  "timestamp": "2024-04-08T14:30:00.000Z",
  "preset": "nextjs",
  "bundler": "esbuild",
  "production": true,
  "entry": ["./src/main.ts"],
  "systemInfo": {
    "cpus": 8,
    "totalMemory": 16384,
    "freeMemory": 8192,
    "platform": "darwin",
    "arch": "x64"
  },
  "spans": [
    {
      "id": "span_123",
      "name": "core-build",
      "startTime": 1000,
      "endTime": 2500,
      "duration": 1500,
      "status": "completed",
      "attributes": {}
    }
  ],
  "summary": {
    "totalDuration": 2400,
    "totalMemoryDelta": {
      "heapUsed": 157286400,
      "rss": 209715200
    },
    "bundleSize": 524288,
    "modulesCount": 150,
    "success": true
  }
}
```

## API Reference

### `TelemetryCollector`

Main class for collecting telemetry data.

#### Constructor

```typescript
new TelemetryCollector(config: TelemetryConfig, metadata: TelemetryBuildMetadata)
```

#### Methods

| Method                                    | Description                    |
| ----------------------------------------- | ------------------------------ |
| `startSpan(name, attributes?, parentId?)` | Start a new span               |
| `endSpan(spanId, error?)`                 | End a span                     |
| `measureAsync<T>(name, fn, attributes?)`  | Measure async function         |
| `measureSync<T>(name, fn, attributes?)`   | Measure sync function          |
| `markFailed(error)`                       | Mark build as failed           |
| `setSpanAttributes(spanId, attributes)`   | Set additional span attributes |
| `getSpan(spanId)`                         | Get span by ID                 |
| `getAllSpans()`                           | Get all spans                  |
| `getChildSpans(parentId)`                 | Get child spans                |
| `finalize()`                              | Generate final report          |
| `printToConsole()`                        | Print summary to console       |
| `saveReport(path?)`                       | Save report to JSON file       |
| `getSystemInfo()`                         | Get system information         |
| `getTotalDuration()`                      | Get total build duration       |
| `getMemoryDelta()`                        | Get memory delta               |

### Types

```typescript
interface TelemetryConfig {
  enabled: boolean;
  outputFormat: 'console' | 'json' | 'both';
  outputPath: string;
  openTelemetry?: {
    enabled: boolean;
    endpoint?: string;
    serviceName: string;
  };
}

interface TelemetrySpan {
  id: string;
  name: string;
  parentId?: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  attributes: Record<string, unknown>;
  memoryBefore?: NodeJS.MemoryUsage;
  memoryAfter?: NodeJS.MemoryUsage;
  status: 'running' | 'completed' | 'error';
  errorMessage?: string;
}

interface TelemetryReport {
  bundlerVersion: string;
  nodeVersion: string;
  platform: string;
  arch: string;
  timestamp: string;
  preset: string;
  bundler: 'esbuild' | 'webpack';
  production: boolean;
  entry: string | string[];
  systemInfo: TelemetrySystemInfo;
  spans: TelemetrySpan[];
  plugins?: TelemetryPluginMetrics[];
  summary: {
    totalDuration: number;
    totalMemoryDelta: { heapUsed: number; rss: number };
    bundleSize?: number;
    modulesCount?: number;
    success: boolean;
    errorMessage?: string;
  };
}
```

### Utility Functions

```typescript
// Console formatters
formatHeader(bundlerVersion: string): string
formatBuildConfig(metadata: TelemetryBuildMetadata): string
formatPhaseStart(span: TelemetrySpan): string
formatPhaseComplete(span: TelemetrySpan): string
formatPhaseError(span: TelemetrySpan): string
formatSummary(report: TelemetryReport): string
formatDuration(ms: number): string
formatBytes(bytes: number): string

// Report utilities
reportToJSON(report: TelemetryReport, options?: ReportOptions): string
createSummaryReport(report: TelemetryReport): object
compareReports(report1: TelemetryReport, report2: TelemetryReport): object
extractPluginMetrics(spans: TelemetrySpan[]): TelemetryPluginMetrics[]
```

## Environment Variables

- `AZION_TELEMETRY=false` - Disable telemetry collection

## License

MIT
