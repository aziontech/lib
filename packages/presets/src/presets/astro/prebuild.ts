import { copyDirectory, exec, getPackageManager } from 'azion/utils/node';
import { readFile } from 'fs/promises';

/**
 * Runs custom prebuild actions for Astro
 */
async function prebuild() {
  const packageManager = await getPackageManager();
  const newOutDir = '.edge/storage';
  let outDir = 'dist';

  // check if an output path is specified in config file (support .ts then .mjs)
  let configFileContent: string;
  try {
    configFileContent = await readFile('./astro.config.ts', 'utf-8');
  } catch {
    configFileContent = await readFile('./astro.config.mjs', 'utf-8');
  }
  const attributeMatch = Array.from(
    configFileContent.matchAll(/outDir:(.*)\n/g),
    (match) => match
  )[0];
  if (attributeMatch) {
    outDir = attributeMatch[1].trim();
  }

  await exec(`${packageManager} run build`, {
    scope: 'Astro',
    verbose: true,
  });

  copyDirectory(outDir, newOutDir);
}

export default prebuild;
