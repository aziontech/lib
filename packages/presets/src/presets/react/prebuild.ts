import { BuildConfiguration, BuildContext } from 'azion/config';
import { copyDirectory, exec, getPackageManager } from 'azion/utils/node';
import { lstat, mkdir, readFile } from 'fs/promises';
import { join } from 'path';

/**
 * Check if the vite.config file exists
 */
async function viteConfigExists(): Promise<boolean> {
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
 * Read vite.config build output
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
 * Runs custom prebuild actions for React
 */
async function prebuild(_: BuildConfiguration, ctx: BuildContext): Promise<void> {
  // if skipFrameworkBuild is true, we need to create the dist folder
  if (ctx.skipFrameworkBuild) {
    await mkdir('.edge/assets', { recursive: true });
    return;
  }

  const packageManager = await getPackageManager();
  const npmArgsForward = packageManager === 'npm' ? '--' : '';
  const defaultViteOutDir = 'dist';
  const destPath = '.edge/assets';

  const isViteProject = await viteConfigExists();

  if (isViteProject) {
    await exec(`${packageManager} run build ${npmArgsForward}`, {
      scope: 'React/Vite',
      verbose: true,
    });

    const config = await readViteBuildOutput();
    const outDir = config?.build?.outDir || defaultViteOutDir;
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
