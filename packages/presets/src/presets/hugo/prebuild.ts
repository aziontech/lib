import { copyDirectory, exec, getPackageManager } from 'azion/utils/node';

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
  copyDirectory(outDir, newOutDir);
}

export default prebuild;
