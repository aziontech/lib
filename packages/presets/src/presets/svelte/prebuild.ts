import { exec, getPackageManager } from 'azion/utils/node';
import { rename } from 'fs/promises';

/**
 * Runs custom prebuild actions for Svelte
 */
async function prebuild(): Promise<void> {
  const packageManager = await getPackageManager();
  const newOutDir = '.edge/storage';
  const outDir = 'build';

  await exec(`${packageManager} run build`, {
    scope: 'Svelte',
    verbose: true,
  });

  // move files to vulcan default path
  await rename(outDir, newOutDir);
}

export default prebuild;
