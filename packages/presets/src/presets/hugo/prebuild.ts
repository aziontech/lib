import { BuildConfiguration, BuildContext } from 'azion/config';
import { exec, getPackageManager } from 'azion/utils/node';
import { mkdir } from 'fs/promises';

/**
 * Runs custom prebuild actions for Hugo
 */
async function prebuild(_: BuildConfiguration, ctx: BuildContext): Promise<void> {
  const packageManager = await getPackageManager();
  const outDir = 'public';

  // If skipFrameworkBuild is true, we need to create the dist folder
  if (ctx.skipFrameworkBuild) {
    await mkdir(outDir, { recursive: true });
    return;
  }

  const command = packageManager === 'npm' ? 'npx' : packageManager;
  await exec(`${command} hugo`, {
    scope: 'Hugo',
    verbose: true,
  });
}

export default prebuild;
