import { copyDirectory, exec, getPackageManager } from 'azion/utils/node';
import { lstat, rm } from 'fs/promises';

const packageManager = await getPackageManager();

/**
 * Check if the project uses the "/docs"
 */
async function docsFolderExists(): Promise<boolean> {
  try {
    await lstat('docs/');
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Runs custom prebuild actions for VitePress
 */
async function prebuild(): Promise<void> {
  const newOutDir = '.edge/storage';

  // The main folder for VuePress usually is 'docs',
  // however the users also might use the root folder
  const outDir = (await docsFolderExists()) ? 'docs/.vuepress/dist' : '.vuepress/dist';

  await exec(`${packageManager} run docs:build`, {
    scope: 'VuePress',
    verbose: true,
  });

  // move files to vulcan default path
  copyDirectory(outDir, newOutDir);

  rm(outDir, { recursive: true, force: true });
}

export default prebuild;
