import { spawn } from 'child_process';
import signale from 'signale';
import type { ExecOptions, ProcessOutput } from './types';

/**
 * @function
 * @description Execute a command asynchronously and retrieve the standard output and standard error.
 * @example
 * // Basic usage
 * await exec('npm install', { scope: 'Install' });
 *
 * // With verbose output
 * await exec('npm run build', {
 *   scope: 'Build',
 *   verbose: true
 * });
 *
 * // With interactive mode
 * await exec('npx vue create my-project', {
 *   scope: 'Vue',
 *   interactive: true
 * });
 */
async function exec(
  command: string,
  { scope = 'Azion', verbose = false, interactive = false }: ExecOptions = {},
): Promise<ProcessOutput> {
  const stream = new signale.Signale({
    interactive: true,
    scope: scope,
  });

  return new Promise((resolve, reject) => {
    const args = command.split(' ');
    const cmd = args.shift() as string;
    let stdout = '';
    let stderr = '';

    const execProcess = spawn(cmd, args, {
      shell: true,
      stdio: interactive ? 'inherit' : 'pipe',
    });

    if (!interactive) {
      execProcess.stdout?.on('data', (data: Buffer) => {
        const output = data.toString();
        stdout += output;

        if (verbose) {
          stream.info(output);
        }
      });

      execProcess.stderr?.on('data', (data: Buffer) => {
        const output = data.toString();
        stderr += output;

        if (verbose) {
          if (output.toLowerCase().includes('error')) {
            stream.error(output);
          } else {
            stream.info(output);
          }
        }
      });

      execProcess.on('error', (error: Error) => {
        reject(error);
      });
    }

    execProcess.on('close', (code: number | null) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`Command '${command}' failed with code ${code}`));
      }
    });

    execProcess.on('exit', (code: number | null) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`Command '${command}' failed with code ${code}`));
      }
    });
  });
}

export default exec;
