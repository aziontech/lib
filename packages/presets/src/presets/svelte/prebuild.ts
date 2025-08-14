import { BuildConfiguration, BuildContext } from 'azion/config';
import { exec, getPackageManager } from 'azion/utils/node';
import { mkdir } from 'fs/promises';

/**
 * Runs custom prebuild actions for Svelte
 */
async function prebuild(_: BuildConfiguration, ctx: BuildContext): Promise<void> {
  const packageManager = await getPackageManager();
  const outDir = 'build';

  // if skipFrameworkBuild is true, we need to create the dist folder
  if (ctx.skipFrameworkBuild) {
    await mkdir(outDir, { recursive: true });
    return;
  }

  await exec(`${packageManager} run build`, {
    scope: 'Svelte',
    verbose: true,
  });
}

export default prebuild;
