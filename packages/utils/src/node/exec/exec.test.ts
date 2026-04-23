import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { spawn } from 'child_process';
import exec from './index';

jest.mock('child_process');
jest.mock('signale', () => ({
  Signale: jest.fn().mockImplementation(() => ({
    info: jest.fn(),
    error: jest.fn(),
  })),
}));

describe('exec utils', () => {
  let mockChildProcess: {
    stdout: { on: jest.Mock };
    stderr: { on: jest.Mock };
    on: jest.Mock;
  };

  beforeEach(() => {
    mockChildProcess = {
      stdout: { on: jest.fn() },
      stderr: { on: jest.fn() },
      on: jest.fn(),
    };
    (spawn as jest.Mock).mockReturnValue(mockChildProcess);
  });

  test('Should resolve when process closes with code 0', async () => {
    mockChildProcess.on.mockImplementation((event: unknown, callback: unknown) => {
      if (event === 'close') {
        (callback as (code: number) => void)(0);
      }
    });

    await expect(exec('echo test')).resolves.toEqual({
      stdout: '',
      stderr: '',
    });
  });

  test('Should reject when process closes with non-zero code', async () => {
    mockChildProcess.on.mockImplementation((event: unknown, callback: unknown) => {
      if (event === 'close') {
        (callback as (code: number) => void)(1);
      }
    });

    await expect(exec('echo test')).rejects.toThrow("Command 'echo test' failed with code 1");
  });

  test('Should reject when process emits an error', async () => {
    const error = new Error('Test error');

    mockChildProcess.on.mockImplementation((event: unknown, callback: unknown) => {
      if (event === 'error') {
        (callback as (err: Error) => void)(error);
      }
    });

    await expect(exec('echo test')).rejects.toEqual(error);
  });

  test('Should log stdout and stderr when verbose is true', async () => {
    mockChildProcess.on.mockImplementation((event: unknown, callback: unknown) => {
      if (event === 'close') {
        (callback as (code: number) => void)(0);
      }
    });

    mockChildProcess.stdout.on.mockImplementation((event: unknown, callback: unknown) => {
      if (event === 'data') {
        (callback as (data: string) => void)('Test stdout');
      }
    });

    mockChildProcess.stderr.on.mockImplementation((event: unknown, callback: unknown) => {
      if (event === 'data') {
        (callback as (data: string) => void)('Test stderr');
      }
    });

    await exec('echo test', { verbose: true });
  });
});
