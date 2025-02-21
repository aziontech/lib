import { exec, getPackageManager } from 'azion/utils/node';
import { readFile, rename } from 'fs/promises';

/**
 * Runs custom prebuild actions for Astro
 */
async function prebuild() {
  const packageManager = await getPackageManager();
  const newOutDir = '.edge/storage';
  let outDir = 'dist';

  // check if an output path is specified in config file
  const configFileContent = await readFile('./astro.config.mjs', 'utf-8');
  const attributeMatch = Array.from(configFileContent.matchAll(/outDir:(.*)\n/g), (match) => match)[0];
  if (attributeMatch) {
    outDir = attributeMatch[1].trim();
  }

  await exec(`${packageManager} run build`, {
    scope: 'Astro',
    verbose: true,
  });

  // move files to vulcan default path
  await rename(outDir, newOutDir);
}

export default prebuild;
