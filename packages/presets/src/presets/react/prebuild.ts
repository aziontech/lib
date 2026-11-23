import { BuildConfiguration, BuildContext } from '@aziontech/config';
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
 * Runs custom prebuild actions for React
 */
async function prebuild(_: BuildConfiguration, ctx: BuildContext): Promise<void> {
  const defaultViteOutDir = 'dist';
  const defaultCraOutDir = 'build';
  const destPath = '.edge/assets';

  // If skipFrameworkBuild is true, reuse the output of a previous framework build.
  // Vite outputs to `outDir` (default `dist`) and CRA to `build` when run without BUILD_PATH.
  if (ctx.skipFrameworkBuild) {
    await mkdir(destPath, { recursive: true });
    let outDir = defaultCraOutDir;
    if (await viteConfigExists()) {
      outDir = (await readViteOutDir()) || defaultViteOutDir;
    }
    if (await pathExists(outDir)) {
      copyDirectory(outDir, destPath);
    }
    return;
  }

  const packageManager = await getPackageManager();
  const npmArgsForward = packageManager === 'npm' ? '--' : '';

  const isViteProject = await viteConfigExists();

  if (isViteProject) {
    await exec(`${packageManager} run build ${npmArgsForward}`, {
      scope: 'React/Vite',
      verbose: true,
    });

    const outDir = (await readViteOutDir()) || defaultViteOutDir;
    await assertOutDirExists(outDir);
    copyDirectory(outDir, destPath);
  }

  if (!isViteProject) {
    await exec(`BUILD_PATH="${destPath}" ${packageManager} run build`, {
      scope: 'React',
      verbose: true,
    });
  }
}

export default prebuild;
