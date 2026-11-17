import { BuildConfiguration, BuildContext } from '@aziontech/config';
import { copyDirectory, exec, getPackageManager } from '@aziontech/utils/node';
import { lstat, mkdir, readFile, rm } from 'fs/promises';
import { join } from 'path';

const edgeStorageDir = '.edge/assets';
const defaultViteOutDir = 'dist';

/**
 * Check if the vite.config file exists.
 * @returns {boolean} True if the file exists, false otherwise.
 */
async function viteConfigExists() {
  const files = ['./vite.config.js', './vite.config.ts'];
  const checks = files.map(async (file) => {
    try {
      await lstat(file);
      return true;
    } catch {
      return false;
    }
  });

  const results = await Promise.all(checks);
  return results.includes(true);
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
 * Read vite.config build output
 * @returns {object} The parsed configuration object or null if the file doesn't exist.
 */
async function readViteBuildOutput() {
  try {
    const isTypescript = await lstat('./vite.config.ts').then(
      () => true,
      () => false,
    );
    const pathConfigFile = join(process.cwd(), isTypescript ? 'vite.config.ts' : 'vite.config.js');
    const configFileContent = await readFile(pathConfigFile, 'utf-8');
    const defineConfig = configFileContent.match(/defineConfig\(([\s\S]*)\)/);

    if (!defineConfig) {
      throw new Error('defineConfig not found');
    }

    const buildConfig = defineConfig[1].match(/build: *({[\s\S]*?}),/);

    if (!buildConfig) {
      throw new Error('build config not found');
    }

    const buildConfigObject = JSON.parse(buildConfig[1].replace(/(\w+):/g, '"$1":').replace(/'/g, '"'));

    return Promise.resolve({ build: buildConfigObject });
  } catch {
    return null;
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
      const config = await readViteBuildOutput();
      const outDir = config?.build?.outDir || defaultViteOutDir;
      if (await pathExists(outDir)) {
        copyDirectory(outDir, edgeStorageDir);
      }
    }
    return;
  }

  let outDir = defaultViteOutDir;
  const destPath = edgeStorageDir;

  const isViteProject = await viteConfigExists();

  if (isViteProject) {
    if (!ctx.skipFrameworkBuild) {
      await exec(`${packageManager} run build ${npmArgsForward}`);
    }

    const config = await readViteBuildOutput();

    if (config?.build?.outDir) {
      outDir = config.build.outDir;
    }

    copyDirectory(outDir, destPath);
    rm(outDir, { recursive: true, force: true });
  } else {
    if (!ctx.skipFrameworkBuild) {
      await exec(`BUILD_PATH="./.edge/assets" ${packageManager} run build`);
    }
  }
}

export default prebuild;
