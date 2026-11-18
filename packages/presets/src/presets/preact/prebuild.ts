import { BuildConfiguration, BuildContext } from '@aziontech/config';
import { copyDirectory, exec, getPackageManager } from '@aziontech/utils/node';
import { lstat, mkdir, rm } from 'fs/promises';
import { assertOutDirExists, readViteOutDir, viteConfigExists } from '../../shared/viteBuildOutput';

const edgeStorageDir = '.edge/assets';
const defaultViteOutDir = 'dist';

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
 * Runs custom prebuild actions
 */
async function prebuild(_: BuildConfiguration, ctx: BuildContext) {
  const packageManager = await getPackageManager();
  const npmArgsForward = packageManager === 'npm' ? '--' : '';

  // If skipFrameworkBuild is true, reuse the output of a previous framework build.
  // If the outDir is gone (a regular build removes it after copying), keep what is already in the storage dir.
  if (ctx.skipFrameworkBuild) {
    await mkdir(edgeStorageDir, { recursive: true });
    if (await viteConfigExists()) {
      const outDir = (await readViteOutDir()) || defaultViteOutDir;
      if (await pathExists(outDir)) {
        copyDirectory(outDir, edgeStorageDir);
      }
    }
    return;
  }

  const destPath = edgeStorageDir;

  const isViteProject = await viteConfigExists();

  if (isViteProject) {
    if (!ctx.skipFrameworkBuild) {
      await exec(`${packageManager} run build ${npmArgsForward}`);
    }

    const outDir = (await readViteOutDir()) || defaultViteOutDir;
    await assertOutDirExists(outDir);

    copyDirectory(outDir, destPath);
    rm(outDir, { recursive: true, force: true });
  } else {
    if (!ctx.skipFrameworkBuild) {
      await exec(`BUILD_PATH="./.edge/assets" ${packageManager} run build`);
    }
  }
}

export default prebuild;
