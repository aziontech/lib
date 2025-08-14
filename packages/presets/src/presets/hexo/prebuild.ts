import { BuildConfiguration, BuildContext } from 'azion/config';
import { exec, getPackageManager } from 'azion/utils/node';
import { mkdir, readFile } from 'fs/promises';

/**
 * Runs custom prebuild actions for Hexo
 */
async function prebuild(_: BuildConfiguration, ctx: BuildContext): Promise<void> {
  const packageManager = await getPackageManager();
  let outDir = 'public';

  // If skipFrameworkBuild is true, we need to create the dist folder
  if (ctx.skipFrameworkBuild) {
    await mkdir(outDir, { recursive: true });
    return;
  }

  // check if an output path is specified in config file
  const configFileContent = await readFile('./_config.yml', 'utf-8');
  const attributeMatch = Array.from(configFileContent.matchAll(/public_dir:(.*)\n/g), (match) => match)[0];
  if (attributeMatch) {
    outDir = attributeMatch[1].trim().replace(/["']/g, '');
  }

  const command = packageManager === 'npm' ? 'npx' : packageManager;
  await exec(`${command} hexo generate`, {
    scope: 'Hexo',
    verbose: true,
  });
}

export default prebuild;
