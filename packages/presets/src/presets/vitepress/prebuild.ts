import { BuildConfiguration, BuildContext } from 'azion/config';
import { copyDirectory, exec, getPackageManager } from 'azion/utils/node';
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
 * Runs custom prebuild actions for VitePress
 */
async function prebuild(_: BuildConfiguration, ctx: BuildContext): Promise<void> {
  const packageManager = await getPackageManager();
  const newOutDir = '.edge/assets';

  // The main folder for VitePress usually is 'docs',
  // however the users also might use the root folder
  const outDir = (await docsFolderExists()) ? 'docs/.vitepress/dist' : '.vitepress/dist';

  // If skipFrameworkBuild is true, we need to create the dist folder
  if (ctx.skipFrameworkBuild) {
    await mkdir(newOutDir, { recursive: true });
    return;
  }

  await exec(`${packageManager} run docs:build`, {
    scope: 'VitePress',
    verbose: true,
  });

  // move files to vulcan default path
  copyDirectory(outDir, newOutDir);
}

export default prebuild;
