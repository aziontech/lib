import type { BuildConfiguration, BuildContext } from '@aziontech/config';
import { copyDirectory, exec, getPackageManager } from '@aziontech/utils/node';
import { lstat, mkdir } from 'fs/promises';
import { assertOutDirExists, readViteOutDir, viteConfigExists } from '../../shared/viteBuildOutput';

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
 * Runs custom prebuild actions for Vue
 */
async function prebuild(_: BuildConfiguration, ctx: BuildContext): Promise<void> {
  const packageManager = await getPackageManager();
  const npmArgsForward = packageManager === 'npm' ? '--' : '';
  const defaultViteOutDir = 'dist';
  const destPath = '.edge/assets';

  // If skipFrameworkBuild is true, reuse the output of a previous framework build
  // (vite outDir, or the default `dist` for Vue CLI) and copy it to destPath
  if (ctx.skipFrameworkBuild) {
    const outDir = (await readViteOutDir()) || defaultViteOutDir;

    await mkdir(destPath, { recursive: true });
    if (await pathExists(outDir)) {
      copyDirectory(outDir, destPath);
    }
    return;
  }

  const isViteProject = await viteConfigExists();

  if (isViteProject) {
    await exec(`${packageManager} run build ${npmArgsForward}`, {
      scope: 'Vue/Vite',
      verbose: true,
    });

    const outDir = (await readViteOutDir()) || defaultViteOutDir;
    await assertOutDirExists(outDir);

    copyDirectory(outDir, destPath);
  }

  if (!isViteProject) {
    await exec(`${packageManager} run build ${npmArgsForward} --dest ${destPath}`, {
      scope: 'Vue',
      verbose: true,
    });
  }
}

export default prebuild;
