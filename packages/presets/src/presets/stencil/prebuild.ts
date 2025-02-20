import { exec, getPackageManager } from 'azion/utils/node';
import { rename } from 'fs/promises';

/**
 * Runs custom prebuild actions for Stencil
 */
async function prebuild(): Promise<void> {
  const packageManager = await getPackageManager();
  const newOutDir = '.edge/storage';
  const outDir = 'www';

  await exec(`${packageManager} run build`, {
    scope: 'Stencil',
    verbose: true,
  });

  // move files to vulcan default path
  await rename(outDir, newOutDir);
}

export default prebuild;
