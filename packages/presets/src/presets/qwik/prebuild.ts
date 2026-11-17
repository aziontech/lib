import { BuildConfiguration, BuildContext } from '@aziontech/config';
import { copyDirectory, exec, getPackageManager } from '@aziontech/utils/node';
import { lstat, mkdir, readFile } from 'fs/promises';

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
 * Read the outDir from the static adapter config, if specified
 */
async function readOutDir(defaultOutDir: string): Promise<string> {
  try {
    const configFileContent = await readFile('./adapters/static/vite.config.ts', 'utf-8');
    const attributeMatch = Array.from(configFileContent.matchAll(/outDir:(.*)\n/g), (match) => match)[0];
    if (attributeMatch) {
      return attributeMatch[1].trim();
    }
  } catch {
    // Config file doesn't exist or doesn't have outDir specified
  }
  return defaultOutDir;
}

/**
 * Runs custom prebuild actions for Qwik
 */
async function prebuild(_: BuildConfiguration, ctx: BuildContext): Promise<void> {
  const packageManager = await getPackageManager();
  const newOutDir = '.edge/assets';
  const defaultOutDir = 'dist';

  // If skipFrameworkBuild is true, reuse the output of a previous framework build
  if (ctx.skipFrameworkBuild) {
    await mkdir(newOutDir, { recursive: true });
    const outDir = await readOutDir(defaultOutDir);
    if (await pathExists(outDir)) {
      copyDirectory(outDir, newOutDir);
    }
    return;
  }

  const outDir = await readOutDir(defaultOutDir);

  await exec(`${packageManager} run build`, {
    scope: 'Qwik',
    verbose: true,
  });
  // move files to bundler default path
  copyDirectory(outDir, newOutDir);
}

export default prebuild;
