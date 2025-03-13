import { copyDirectory, exec } from 'azion/utils/node';

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
  copyDirectory(outDir, newOutDir);
}

export default prebuild;
