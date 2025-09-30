import { copyDirectory, exec, getPackageManager } from 'azion/utils/node';
import { lstat } from 'fs/promises';

/**
 * Check if the project uses the "/docs"
 */
async function docsFolderExists(): Promise<boolean> {
  try {
    await lstat('docs/');
    return true;
  } catch {
    return false;
  }
}

/**
 * Runs custom prebuild actions for VitePress
 */
async function prebuild(): Promise<void> {
  const packageManager = await getPackageManager();
  const newOutDir = '.edge/storage';

  // The main folder for VitePress usually is 'docs',
  // however the users also might use the root folder
  const outDir = (await docsFolderExists()) ? 'docs/.vitepress/dist' : '.vitepress/dist';

  await exec(`${packageManager} run docs:build`, {
    scope: 'VitePress',
    verbose: true,
  });

  // move files to vulcan default path
  copyDirectory(outDir, newOutDir);
}

export default prebuild;
