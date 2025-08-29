/* eslint-disable @typescript-eslint/no-explicit-any */
import { readFileSync } from 'fs';
import { resolve } from 'path';

import { copyDirectory, feedback } from 'azion/utils/node';
import VercelUtils from './utils/vercel/index';

import { AzionPrebuildResult, BuildConfiguration, BuildContext } from 'azion/config';
import runDefaultBuild from './default/prebuild/index.js';
import { validationSupportAndRetrieveFromVcConfig } from './default/prebuild/validation/support.js';
import runNodeBuild from './node/prebuild/index.js';
import prebuildStatic from './static/prebuild.js';
import { getNextConfig } from './utils/utils.next.js';

const { deleteTelemetryFiles, createVercelProjectConfig, runVercelBuild } = VercelUtils;

/**
 * Create vercel project config when necessary.
 */
async function vercelPrebuildActions() {
  try {
    feedback.prebuild.info('Checking vercel config file ...');
    createVercelProjectConfig();

    feedback.prebuild.info('Running Next.js vercel build ...');
    await runVercelBuild();

    feedback.prebuild.info('Cleaning files ...');
    deleteTelemetryFiles();
  } catch (error) {
    feedback.prebuild.error(error);
    process.exit(1);
  }
}

async function generateNextManifest(runtimes: string[]) {
  if (runtimes.includes('node')) {
    const staticsFilePath = resolve(process.cwd(), '.edge/next-build/statics.js');
    const staticsFileContent = readFileSync(staticsFilePath, 'utf8');

    // Extract the assets object from the file content
    const assetsMatch = staticsFileContent.match(/export const assets = ({[\s\S]*?});/);
    if (!assetsMatch) {
      throw new Error('Could not find assets object in statics.js');
    }
  }
}

/**
 *
 */
function copyVercelStaticGeneratedFiles(outputDir: string) {
  copyDirectory('.vercel/output/static', outputDir);
}

/**
 * Validates if static site mode is enabled in next config.
 * @param {object} nextConfig - the config as JSON object.
 * @returns {boolean} - if the static site
 */
function validateStaticSiteMode(nextConfig: Record<string, any>) {
  if (nextConfig && nextConfig.output && nextConfig.output === 'export') {
    return true;
  }
  return false;
}

/**
 * Prebuild process for Next.js projects.
 */
async function prebuild(buildConfig: BuildConfiguration, ctx: BuildContext): Promise<AzionPrebuildResult | undefined> {
  const outputDir = resolve(process.cwd(), '.edge/next-build-assets');

  feedback.prebuild.info('Starting Next.js build process ...');

  if (!ctx.skipFrameworkBuild) {
    await vercelPrebuildActions();
  }

  const nextConfig = await getNextConfig();
  if (validateStaticSiteMode(nextConfig)) {
    return prebuildStatic(ctx);
  }

  const {
    vcConfigObjects,
    valid: validSupport,
    version: nextVersion,
    runtimes: projectRuntimes,
    minorVersion,
    invalidFunctions,
  } = (await validationSupportAndRetrieveFromVcConfig()) as any;

  feedback.prebuild.info('Detected Next.js version:', nextVersion);
  if (!validSupport) {
    feedback.prebuild.error(
      `Nextjs version (${nextVersion}) not supported to "${projectRuntimes}" runtime(s).
      This project is not an edge project
      Make sure that following files have a correct configuration about edge runtime\n
      ${invalidFunctions.map((invalidFunction: any) => {
        return `\n       - ${invalidFunction.function}`;
      })}

      Maybe this links can help you\n
      https://nextjs.org/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes#segment-runtime-option
      https://nextjs.org/docs/pages/building-your-application/routing/api-routes#edge-api-routes\n
      `,
    );
    process.exit(1);
  }

  // build node functions (custom node server)
  if (projectRuntimes.includes('node')) {
    await runNodeBuild(minorVersion, buildConfig);
  }

  // build routing system and functions
  const prebuildResult = await runDefaultBuild({
    vcConfigObjects,
    nextVersion,
    projectRuntimes,
  } as any);

  // remove node handler inject on handler
  const nodeHandlerFile = 'src/presets/next/node/handler/index.js';

  if (Array.isArray(projectRuntimes) && projectRuntimes.length === 1 && projectRuntimes[0] === 'edge') {
    prebuildResult.filesToInject = prebuildResult.filesToInject.filter(
      (file: string) => !file.includes(nodeHandlerFile),
    );
  }

  await generateNextManifest(projectRuntimes);

  copyVercelStaticGeneratedFiles(outputDir);

  feedback.prebuild.success('Next.js build adaptation completed successfully.');

  return prebuildResult;
}

export default prebuild;
