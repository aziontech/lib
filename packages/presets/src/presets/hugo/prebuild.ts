import { exec, getPackageManager } from 'azion/utils/node';
import { rename } from 'fs/promises';

/**
 * Runs custom prebuild actions for Hugo
 */
async function prebuild(): Promise<void> {
  const packageManager = await getPackageManager();
  const newOutDir = '.edge/storage';
  const outDir = 'public';

  const command = packageManager === 'npm' ? 'npx' : packageManager;
  await exec(`${command} hugo`, {
    scope: 'Hugo',
    verbose: true,
  });

  // move files to vulcan default path
  await rename(outDir, newOutDir);
}

export default prebuild;
