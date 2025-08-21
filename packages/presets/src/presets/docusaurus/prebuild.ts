import { BuildConfiguration, BuildContext } from 'azion/config';
import { exec, getPackageManager } from 'azion/utils/node';
import { mkdir } from 'fs/promises';

/**
 * Runs custom prebuild actions for Docusaurus
 */
async function prebuild(_: BuildConfiguration, ctx: BuildContext): Promise<void> {
  const packageManager = await getPackageManager();
  const outDir = 'build';

  // If skipFrameworkBuild is true, we need to create the dist folder
  if (ctx.skipFrameworkBuild) {
    await mkdir(outDir, { recursive: true });
    return;
  }

  await exec(`${packageManager} run build`, {
    scope: 'Docusaurus',
    verbose: true,
  });
}

export default prebuild;
