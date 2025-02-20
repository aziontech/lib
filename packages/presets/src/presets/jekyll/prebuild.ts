import { exec } from 'azion/utils/node';
import { rename } from 'fs/promises';

/**
 * Runs custom prebuild actions for Jekyll
 */
async function prebuild(): Promise<void> {
  const newOutDir = '.edge/storage';
  const outDir = '_site';

  await exec('bundle install && bundle exec jekyll build', {
    scope: 'Jekyll',
    verbose: true,
  });

  // move files to vulcan default path
  await rename(outDir, newOutDir);
}

export default prebuild;
