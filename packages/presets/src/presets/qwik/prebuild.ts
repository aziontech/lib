import { BuildConfiguration, BuildContext } from 'azion/config';
import { copyDirectory, exec, getPackageManager } from 'azion/utils/node';
import { mkdir, readFile } from 'fs/promises';

/**
 * Runs custom prebuild actions for Qwik
 */
async function prebuild(_: BuildConfiguration, ctx: BuildContext): Promise<void> {
  const packageManager = await getPackageManager();
  const newOutDir = '.edge/assets';
  let outDir = 'dist';

  // if skipFrameworkBuild is true, we need to create the dist folder
  if (ctx.skipFrameworkBuild) {
    await mkdir(newOutDir, { recursive: true });
    return;
  }

  // Check if an output path is specified in config file
  try {
    const configFileContent = await readFile('./adapters/static/vite.config.ts', 'utf-8');
    const attributeMatch = Array.from(configFileContent.matchAll(/outDir:(.*)\n/g), (match) => match)[0];
    if (attributeMatch) {
      outDir = attributeMatch[1].trim();
    }
  } catch {
    // Config file doesn't exist or doesn't have outDir specified
  }

  await exec(`${packageManager} run build`, {
    scope: 'Qwik',
    verbose: true,
  });
  // move files to bundler default path
  copyDirectory(outDir, newOutDir);
}

export default prebuild;
