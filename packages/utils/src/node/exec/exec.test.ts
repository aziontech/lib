import { spawn } from 'child_process';
import exec from './index';

interface MockChildProcess {
  stdout: { on: jest.Mock };
  stderr: { on: jest.Mock };
  on: jest.Mock;
}

jest.mock('child_process');
jest.mock('signale', () => ({
  Signale: jest.fn().mockImplementation(() => ({
    info: jest.fn(),
    error: jest.fn(),
  })),
}));

describe('exec utils', () => {
  let mockChildProcess: MockChildProcess;

  beforeEach(() => {
    mockChildProcess = {
      stdout: { on: jest.fn() },
      stderr: { on: jest.fn() },
      on: jest.fn(),
    };
    (spawn as jest.Mock).mockReturnValue(mockChildProcess);
  });

  test('Should resolve when process closes with code 0', async () => {
    mockChildProcess.on.mockImplementation((event, callback) => {
      if (event === 'close') {
        callback(0);
      }
    });

    await expect(exec('echo test')).resolves.toEqual({
      stdout: '',
      stderr: '',
    });
  });

  test('Should reject when process closes with non-zero code', async () => {
    mockChildProcess.on.mockImplementation((event, callback) => {
      if (event === 'close') {
        callback(1);
      }
    });

    await expect(exec('echo test')).rejects.toThrow("Command 'echo test' failed with code 1");
  });

  test('Should reject when process emits an error', async () => {
    const error = new Error('Test error');

    mockChildProcess.on.mockImplementation((event, callback) => {
      if (event === 'error') {
        callback(error);
      }
    });

    await expect(exec('echo test')).rejects.toEqual(error);
  });

  test('Should log stdout and stderr when verbose is true', async () => {
    mockChildProcess.on.mockImplementation((event, callback) => {
      if (event === 'close') {
        callback(0);
      }
    });

    mockChildProcess.stdout.on.mockImplementation((event, callback) => {
      if (event === 'data') {
        callback('Test stdout');
      }
    });

    mockChildProcess.stderr.on.mockImplementation((event, callback) => {
      if (event === 'data') {
        callback('Test stderr');
      }
    });

    await exec('echo test', { verbose: true });
  });
});
