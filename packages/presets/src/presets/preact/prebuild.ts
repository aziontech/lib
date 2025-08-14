import { BuildConfiguration, BuildContext } from 'azion/config';
import { copyDirectory, exec, getPackageManager } from 'azion/utils/node';
import { lstat, mkdir, readFile, rm } from 'fs/promises';
import { join } from 'path';

const packageManager = await getPackageManager();
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
    } catch (err) {
      return false;
    }
  });

  const results = await Promise.all(checks);
  return results.includes(true);
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
  } catch (err) {
    return null;
  }
}

/**
 * Runs custom prebuild actions
 */
async function prebuild(_: BuildConfiguration, ctx: BuildContext) {
  const npmArgsForward = packageManager === 'npm' ? '--' : '';

  // if skipFrameworkBuild is true, we need to create the dist folder
  if (ctx.skipFrameworkBuild) {
    await mkdir(edgeStorageDir, { recursive: true });
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
