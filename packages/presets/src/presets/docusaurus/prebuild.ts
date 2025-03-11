import { copyDirectory, exec, getPackageManager } from 'azion/utils/node';

/**
 * Runs custom prebuild actions for Docusaurus
 */
async function prebuild() {
  const packageManager = await getPackageManager();
  const newOutDir = '.edge/storage';
  const outDir = 'build';

  await exec(`${packageManager} run build`, {
    scope: 'Docusaurus',
    verbose: true,
  });

  // move files to vulcan default path
  copyDirectory(outDir, newOutDir);
}

export default prebuild;
