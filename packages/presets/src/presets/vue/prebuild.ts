import { exec, getPackageManager } from 'azion/utils/node';
import { lstat, readFile, rename } from 'fs/promises';
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
    } catch (err) {
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
    // eslint-disable-next-line no-eval
    const buildConfigObject = JSON.parse(buildConfig[1].replace(/(\w+):/g, '"$1":').replace(/'/g, '"'));
    return Promise.resolve({ build: buildConfigObject });
  } catch (err) {
    return null;
  }
}

/**
 * Runs custom prebuild actions for Vue
 */
async function prebuild(): Promise<void> {
  const packageManager = await getPackageManager();
  const npmArgsForward = packageManager === 'npm' ? '--' : '';
  const defaultViteOutDir = 'dist';
  const destPath = '.edge/storage';

  const isViteProject = await viteConfigExists();

  if (isViteProject) {
    await exec(`${packageManager} run build ${npmArgsForward}`, {
      scope: 'Vue/Vite',
      verbose: true,
    });

    const config = await readViteBuildOutput();
    const outDir = config?.build?.outDir || defaultViteOutDir;

    await rename(outDir, destPath);
  }

  if (!isViteProject) {
    await exec(`${packageManager} run build ${npmArgsForward} --dest ${destPath}`, {
      scope: 'Vue',
      verbose: true,
    });
  }
}

export default prebuild;
