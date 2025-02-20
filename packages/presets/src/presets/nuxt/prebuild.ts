import { exec } from 'azion/utils/node';
import { rename } from 'fs/promises';

/**
 * Runs custom prebuild actions for Nuxt
 */
async function prebuild(): Promise<void> {
  const newOutDir = '.edge/storage';
  const outDir = '.output/public';

  await exec('npx nuxt generate', {
    scope: 'Nuxt',
    verbose: true,
  });

  // move files to vulcan default path
  await rename(outDir, newOutDir);
}

export default prebuild;
