import { copyDirectory, exec } from 'azion/utils/node';

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
  copyDirectory(outDir, newOutDir);
}

export default prebuild;
