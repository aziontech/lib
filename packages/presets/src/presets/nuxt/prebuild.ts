import { BuildConfiguration, BuildContext } from 'azion/config';
import { exec } from 'azion/utils/node';
import { mkdir } from 'fs/promises';

/**
 * Runs custom prebuild actions for Nuxt
 */
async function prebuild(_: BuildConfiguration, ctx: BuildContext): Promise<void> {
  const outDir = '.output/public';

  // If skipFrameworkBuild is true, we need to create the dist folder
  if (ctx.skipFrameworkBuild) {
    await mkdir(outDir, { recursive: true });
    return;
  }

  await exec('npx nuxt generate', {
    scope: 'Nuxt',
    verbose: true,
  });
}

export default prebuild;
