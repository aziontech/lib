import { BuildConfiguration, BuildContext } from '@aziontech/config';
import { exec } from '@aziontech/utils/node';

/**
 * Runs custom prebuild actions for Nitro
 */
async function prebuild(_: BuildConfiguration, ctx: BuildContext): Promise<void> {
  const skipBuild = ctx.skipFrameworkBuild;

  if (!skipBuild) {
    await exec(`npm run build`, {
      scope: 'Nitro',
      verbose: true,
      interactive: true,
    });
  }
}

export default prebuild;
