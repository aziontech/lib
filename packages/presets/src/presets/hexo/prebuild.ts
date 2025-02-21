import { exec, getPackageManager } from 'azion/utils/node';
import { readFile, rename } from 'fs/promises';

/**
 * Runs custom prebuild actions for Hexo
 */
async function prebuild(): Promise<void> {
  const packageManager = await getPackageManager();
  const newOutDir = '.edge/storage';
  let outDir = 'public';

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

  // move files to vulcan default path
  await rename(outDir, newOutDir);
}

export default prebuild;
