/* eslint-disable no-undef, @typescript-eslint/no-unused-vars */
import { jest } from '@jest/globals';
import child_process from 'child_process';
import fs from 'fs';
import mockFs from 'mock-fs';
import VercelUtils from './index';

const { deleteTelemetryFiles, createVercelProjectConfig, runVercelBuild } = VercelUtils;

describe('Vercel Utils', () => {
  it('Should delete telemtry files', () => {
    mockFs({
      '.vercel': {
        output: {
          static: {
            _next: {
              __private: {
                'next-telemetry.js': 'telemetry',
              },
            },
          },
        },
      },
    });

    deleteTelemetryFiles();

    expect(fs.existsSync('.vercel/output/static/_next/__private')).toBe(false);

    mockFs.restore();
  });

  it('Should create vercel project config', () => {
    mockFs({
      '.vercel': {},
    });

    const projectConfigContent = { projectId: '_', orgId: '_', settings: {} };

    createVercelProjectConfig();
    const projectConfig = fs.readFileSync('.vercel/project.json', 'utf-8');

    expect(fs.existsSync('.vercel/project.json')).toBe(true);
    expect(projectConfig).toEqual(JSON.stringify(projectConfigContent));

    mockFs.restore();
  });
});

describe('runVercelBuild', () => {
  let spyOnSpawn;

  beforeEach(() => {
    spyOnSpawn = jest.spyOn(child_process, 'spawn').mockImplementation((cmd, args, options) => {
      const execProcess = {
        on: jest.fn(),
      };

      // Simulate a successful command execution
      execProcess.on.mockImplementationOnce((event, callback) => {
        if (event === 'close') {
          callback(0); // Simulate a successful exit code
        }
      });

      return execProcess;
    });
  });

  it('should resolve the promise when the command succeeds', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    spyOnSpawn.mockImplementationOnce((cmd, args, options) => {
      const execProcess = {
        on: jest.fn(),
      };

      // Simulate a successful command execution
      execProcess.on.mockImplementationOnce((event, callback) => {
        if (event === 'close') {
          callback(0); // Simulate a successful exit code
        }
      });

      return execProcess;
    });

    await expect(runVercelBuild()).resolves.toEqual(undefined);

    expect(spyOnSpawn).toHaveBeenCalledWith('npx', ['--yes', 'vercel@32.6.1', 'build', '--prod'], {
      shell: true,
      stdio: 'inherit',
    });
  });

  it('should reject the promise when the command fails', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    spyOnSpawn.mockImplementationOnce((cmd, args, options) => {
      const execProcess = {
        on: jest.fn(),
      };

      execProcess.on.mockImplementationOnce((event, callback) => {
        if (event === 'close') {
          callback(1);
        }
      });

      return execProcess;
    });

    await expect(runVercelBuild()).rejects.toThrow("Command '--yes vercel@32.6.1 build --prod' failed with code 1");

    expect(spyOnSpawn).toHaveBeenCalledWith('npx', ['--yes', 'vercel@32.6.1', 'build', '--prod'], {
      shell: true,
      stdio: 'inherit',
    });
  });
});
