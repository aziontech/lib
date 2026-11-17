import type { BuildConfiguration, BuildContext } from '@aziontech/config';
import { copyDirectory, exec, getPackageManager } from '@aziontech/utils/node';
import { lstat, mkdir } from 'fs/promises';

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
 * Check if a path exists
 */
async function pathExists(path: string): Promise<boolean> {
  try {
    await lstat(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Runs custom prebuild actions for VitePress
 */
async function prebuild(_: BuildConfiguration, ctx: BuildContext): Promise<void> {
  const packageManager = await getPackageManager();
  const newOutDir = '.edge/assets';

  // The main folder for VuePress usually is 'docs',
  // however the users also might use the root folder
  const outDir = (await docsFolderExists()) ? 'docs/.vuepress/dist' : '.vuepress/dist';

  // If skipFrameworkBuild is true, reuse the output of a previous framework build
  if (ctx.skipFrameworkBuild) {
    await mkdir(newOutDir, { recursive: true });
    if (await pathExists(outDir)) {
      copyDirectory(outDir, newOutDir);
    }
    return;
  }

  await exec(`${packageManager} run docs:build`, {
    scope: 'VuePress',
    verbose: true,
  });

  // move files to vulcan default path
  copyDirectory(outDir, newOutDir);
}

export default prebuild;
