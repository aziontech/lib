import { mkdir, rename } from 'fs/promises';
import { join } from 'path';

/**
 * Runs custom prebuild actions for HTML
 */
async function prebuild(): Promise<void> {
  const sourceDir = process.cwd();
  const targetDir = join('.', '.edge', 'storage');

  await mkdir(targetDir, { recursive: true });
  await rename(sourceDir, targetDir);
}

export default prebuild;
