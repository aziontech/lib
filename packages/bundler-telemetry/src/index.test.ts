/**
 * Tests for @aziontech/bundler-telemetry
 */

import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

import {
  TelemetryCollector,
  createSummaryReport,
  extractPluginMetrics,
  formatBuildConfig,
  formatBytes,
  formatDuration,
  formatHeader,
  formatPhaseComplete,
  formatSummary,
  reportToJSON,
} from './index';

// Mock fs module
jest.mock('fs');
jest.mock('fs/promises');

describe('TelemetryCollector', () => {
  let collector: TelemetryCollector;

  const mockConfig = {
    enabled: true,
    outputFormat: 'json' as const,
    outputPath: '.edge/telemetry-report.json',
  };

  const mockMetadata = {
    bundlerVersion: '7.2.0',
    preset: 'nextjs',
    bundler: 'esbuild' as const,
    production: true,
    entry: ['./src/main.ts'],
  };

  beforeEach(() => {
    // Suppress console.log for cleaner test output
    jest.spyOn(console, 'log').mockImplementation(() => {});

    collector = new TelemetryCollector(mockConfig, mockMetadata);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create a collector instance', () => {
      expect(collector).toBeInstanceOf(TelemetryCollector);
    });

    it('should initialize with correct metadata', () => {
      const systemInfo = collector.getSystemInfo();
      expect(systemInfo).toHaveProperty('cpus');
      expect(systemInfo).toHaveProperty('totalMemory');
      expect(systemInfo).toHaveProperty('freeMemory');
      expect(systemInfo).toHaveProperty('platform');
      expect(systemInfo).toHaveProperty('arch');
    });
  });

  describe('startSpan / endSpan', () => {
    it('should start and end a span', () => {
      const spanId = collector.startSpan('test-phase');
      expect(spanId).toBeTruthy();

      collector.endSpan(spanId);

      const span = collector.getSpan(spanId);
      expect(span).toBeDefined();
      expect(span?.status).toBe('completed');
      expect(span?.duration).toBeGreaterThanOrEqual(0);
    });

    it('should record error status when span fails', () => {
      const spanId = collector.startSpan('failing-phase');
      collector.endSpan(spanId, 'Something went wrong');

      const span = collector.getSpan(spanId);
      expect(span?.status).toBe('error');
      expect(span?.errorMessage).toBe('Something went wrong');
    });

    it('should support nested spans', () => {
      const parentId = collector.startSpan('parent-phase');
      const childId = collector.startSpan('child-phase', {}, parentId);

      collector.endSpan(childId);
      collector.endSpan(parentId);

      const childSpan = collector.getSpan(childId);
      expect(childSpan?.parentId).toBe(parentId);
    });
  });

  describe('measureAsync', () => {
    it('should measure async function execution', async () => {
      const result = await collector.measureAsync('async-operation', async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return 'success';
      });

      expect(result).toBe('success');

      const spans = collector.getAllSpans();
      const asyncSpan = spans.find((s) => s.name === 'async-operation');
      expect(asyncSpan).toBeDefined();
      expect(asyncSpan?.duration).toBeGreaterThanOrEqual(10);
    });

    it('should record error when async function throws', async () => {
      await expect(
        collector.measureAsync('failing-async', async () => {
          throw new Error('Async error');
        }),
      ).rejects.toThrow('Async error');

      const spans = collector.getAllSpans();
      const failedSpan = spans.find((s) => s.name === 'failing-async');
      expect(failedSpan?.status).toBe('error');
      expect(failedSpan?.errorMessage).toBe('Async error');
    });
  });

  describe('measureSync', () => {
    it('should measure sync function execution', () => {
      const result = collector.measureSync('sync-operation', () => {
        let sum = 0;
        for (let i = 0; i < 1000; i++) sum += i;
        return sum;
      });

      expect(result).toBe(499500);

      const spans = collector.getAllSpans();
      const syncSpan = spans.find((s) => s.name === 'sync-operation');
      expect(syncSpan).toBeDefined();
      expect(syncSpan?.duration).toBeGreaterThanOrEqual(0);
    });

    it('should record error when sync function throws', () => {
      expect(() =>
        collector.measureSync('failing-sync', () => {
          throw new Error('Sync error');
        }),
      ).toThrow('Sync error');

      const spans = collector.getAllSpans();
      const failedSpan = spans.find((s) => s.name === 'failing-sync');
      expect(failedSpan?.status).toBe('error');
    });
  });

  describe('disabled telemetry', () => {
    it('should not collect telemetry when disabled', () => {
      const disabledCollector = new TelemetryCollector({ ...mockConfig, enabled: false }, mockMetadata);

      const spanId = disabledCollector.startSpan('test-phase');
      disabledCollector.endSpan(spanId);

      // Should still work, just not collect
      expect(spanId).toBe('');
      expect(disabledCollector.getAllSpans()).toHaveLength(0);
    });
  });

  describe('getMemoryDelta', () => {
    it('should return memory delta', () => {
      const delta = collector.getMemoryDelta();
      expect(delta).toHaveProperty('heapUsed');
      expect(delta).toHaveProperty('rss');
    });
  });

  describe('getTotalDuration', () => {
    it('should return total duration', () => {
      const duration = collector.getTotalDuration();
      expect(duration).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('Console Formatters', () => {
  describe('formatDuration', () => {
    it('should format milliseconds correctly', () => {
      expect(formatDuration(50)).toBe('50ms');
      expect(formatDuration(500)).toBe('500ms');
    });

    it('should format seconds correctly', () => {
      expect(formatDuration(1500)).toBe('1.5s');
      expect(formatDuration(10000)).toBe('10.0s');
    });

    it('should format minutes correctly', () => {
      expect(formatDuration(65000)).toBe('1m 5s');
      expect(formatDuration(125000)).toBe('2m 5s');
    });
  });

  describe('formatBytes', () => {
    it('should format bytes correctly', () => {
      expect(formatBytes(512)).toBe('512B');
      expect(formatBytes(1024)).toBe('1.0KB');
      expect(formatBytes(1048576)).toBe('1.0MB');
    });

    it('should handle negative values', () => {
      expect(formatBytes(-512)).toBe('-512B');
      expect(formatBytes(-1048576)).toBe('-1.0MB');
    });
  });

  describe('formatHeader', () => {
    it('should format header with version', () => {
      const result = formatHeader('7.2.0');
      expect(result).toContain('Azion Bundler');
      expect(result).toContain('7.2.0');
    });
  });

  describe('formatBuildConfig', () => {
    it('should format build configuration', () => {
      const result = formatBuildConfig({
        bundlerVersion: '7.2.0',
        preset: 'nextjs',
        bundler: 'esbuild',
        production: true,
        entry: './src/main.ts',
      });
      expect(result).toContain('nextjs');
      expect(result).toContain('esbuild');
      expect(result).toContain('production');
    });
  });

  describe('formatPhaseComplete', () => {
    it('should format completed phase', () => {
      const span = {
        id: 'span-1',
        name: 'test-phase',
        startTime: 100,
        endTime: 200,
        duration: 100,
        status: 'completed' as const,
        attributes: {},
      };
      const result = formatPhaseComplete(span);
      expect(result).toContain('test-phase');
      expect(result).toContain('100ms');
    });

    it('should format error phase', () => {
      const span = {
        id: 'span-1',
        name: 'error-phase',
        startTime: 100,
        endTime: 200,
        duration: 100,
        status: 'error' as const,
        errorMessage: 'Build failed',
        attributes: {},
      };
      const result = formatPhaseComplete(span);
      expect(result).toContain('FAILED');
      expect(result).toContain('Build failed');
    });
  });

  describe('formatSummary', () => {
    it('should format successful build summary', () => {
      const report = {
        bundlerVersion: '7.2.0',
        nodeVersion: 'v18.20.0',
        platform: 'darwin',
        arch: 'x64',
        timestamp: '2024-01-01T00:00:00.000Z',
        preset: 'nextjs',
        bundler: 'esbuild' as const,
        production: true,
        entry: './src/main.ts',
        systemInfo: {
          cpus: 8,
          totalMemory: 16384,
          freeMemory: 8192,
          platform: 'darwin',
          arch: 'x64',
        },
        spans: [],
        summary: {
          totalDuration: 2400,
          totalMemoryDelta: {
            heapUsed: 150000000,
            rss: 200000000,
          },
          success: true,
        },
      };
      const result = formatSummary(report);
      expect(result).toContain('Success');
      expect(result).toContain('2.4s');
    });
  });
});

describe('Reporter Utilities', () => {
  describe('reportToJSON', () => {
    it('should convert report to JSON string', () => {
      const report = {
        bundlerVersion: '7.2.0',
        nodeVersion: 'v18.20.0',
        platform: 'darwin',
        arch: 'x64',
        timestamp: '2024-01-01T00:00:00.000Z',
        preset: 'nextjs',
        bundler: 'esbuild' as const,
        production: true,
        entry: './src/main.ts',
        systemInfo: {
          cpus: 8,
          totalMemory: 16384,
          freeMemory: 8192,
          platform: 'darwin',
          arch: 'x64',
        },
        spans: [],
        summary: {
          totalDuration: 2400,
          totalMemoryDelta: {
            heapUsed: 150000000,
            rss: 200000000,
          },
          success: true,
        },
      };

      const json = reportToJSON(report);
      expect(() => JSON.parse(json)).not.toThrow();
      expect(json).toContain('bundlerVersion');
    });

    it('should support pretty print option', () => {
      const report = {
        bundlerVersion: '7.2.0',
        nodeVersion: 'v18.20.0',
        platform: 'darwin',
        arch: 'x64',
        timestamp: '2024-01-01T00:00:00.000Z',
        preset: 'nextjs',
        bundler: 'esbuild' as const,
        production: true,
        entry: './src/main.ts',
        systemInfo: {
          cpus: 8,
          totalMemory: 16384,
          freeMemory: 8192,
          platform: 'darwin',
          arch: 'x64',
        },
        spans: [],
        summary: {
          totalDuration: 2400,
          totalMemoryDelta: {
            heapUsed: 150000000,
            rss: 200000000,
          },
          success: true,
        },
      };

      const prettyJson = reportToJSON(report, { prettyPrint: true });
      const compactJson = reportToJSON(report, { prettyPrint: false });

      expect(prettyJson.length).toBeGreaterThan(compactJson.length);
    });
  });

  describe('createSummaryReport', () => {
    it('should create a summary report', () => {
      const report = {
        bundlerVersion: '7.2.0',
        nodeVersion: 'v18.20.0',
        platform: 'darwin',
        arch: 'x64',
        timestamp: '2024-01-01T00:00:00.000Z',
        preset: 'nextjs',
        bundler: 'esbuild' as const,
        production: true,
        entry: './src/main.ts',
        systemInfo: {
          cpus: 8,
          totalMemory: 16384,
          freeMemory: 8192,
          platform: 'darwin',
          arch: 'x64',
        },
        spans: [{ id: '1', name: 'phase-1', status: 'completed' as const, startTime: 0, attributes: {} }],
        summary: {
          totalDuration: 2400,
          totalMemoryDelta: {
            heapUsed: 150000000,
            rss: 200000000,
          },
          success: true,
        },
      };

      const summary = createSummaryReport(report);
      expect(summary).toHaveProperty('bundlerVersion', '7.2.0');
      expect(summary).toHaveProperty('preset', 'nextjs');
      expect(summary).toHaveProperty('phaseCount', 1);
    });
  });

  describe('extractPluginMetrics', () => {
    it('should extract plugin metrics from spans', () => {
      const spans = [
        {
          id: '1',
          name: 'plugin:esbuild-plugin',
          duration: 100,
          status: 'completed' as const,
          startTime: 0,
          attributes: {},
        },
        {
          id: '2',
          name: 'plugin:webpack-plugin',
          duration: 200,
          status: 'completed' as const,
          startTime: 0,
          attributes: { filesProcessed: 10 },
        },
        { id: '3', name: 'regular-phase', duration: 50, status: 'completed' as const, startTime: 0, attributes: {} },
      ];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const plugins = extractPluginMetrics(spans as any);
      expect(plugins).toHaveLength(2);
      expect(plugins[0].name).toBe('esbuild-plugin');
      expect(plugins[1].filesProcessed).toBe(10);
    });
  });
});
