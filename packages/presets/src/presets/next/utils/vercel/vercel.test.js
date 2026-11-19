/* eslint-disable no-undef, @typescript-eslint/no-unused-vars */
import { jest } from '@jest/globals';
import child_process from 'child_process';
import fs from 'fs';
import mockFs from 'mock-fs';
import os from 'os';
import path from 'path';
import VercelUtils from './index';

const { deleteTelemetryFiles, createVercelProjectConfig, runVercelBuild } = VercelUtils;

describe('Vercel Utils', () => {
  it('Should delete telemtry files', () => {
    // A real temporary directory: mock-fs does not intercept `fs.rmSync` on Node.js 24, where it is native
    const originalCwd = process.cwd();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vercel-utils-'));
    const privateDir = path.join(tmpDir, '.vercel', 'output', 'static', '_next', '__private');

    try {
      fs.mkdirSync(privateDir, { recursive: true });
      fs.writeFileSync(path.join(privateDir, 'next-telemetry.js'), 'telemetry');
      process.chdir(tmpDir);

      deleteTelemetryFiles();

      expect(fs.existsSync('.vercel/output/static/_next/__private')).toBe(false);
    } finally {
      process.chdir(originalCwd);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
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
