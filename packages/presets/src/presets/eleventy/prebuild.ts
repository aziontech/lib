import { copyDirectory, exec } from 'azion/utils/node';

/**
 * Runs custom prebuild actions for Eleventy
 */
async function prebuild(): Promise<void> {
  const newOutDir = '.edge/storage';
  const outDir = '_site';

  await exec(`npx -y @11ty/eleventy`, {
    scope: 'Eleventy',
    verbose: true,
  });

  // move files to vulcan default path
  copyDirectory(outDir, newOutDir);
}

export default prebuild;
