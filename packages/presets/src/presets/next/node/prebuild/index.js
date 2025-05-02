import fs from 'fs';
import path, { join } from 'path';

import { copyDirectory, feedback, getAbsoluteDirPath } from 'azion/utils/node';
import BuildStatic from './statics/index.js';

/**
 * Run actions to build next for node runtime.
 * @param {string} nextVersion - project next version in package.json
 * @param {object} buildContext - info about the build
 */
async function run(nextVersion, buildContext) {
  feedback.prebuild.info('Running build for next node server ...');

  feedback.prebuild.info('Starting file processing!');

  const OUT_DIR_CUSTOM_SERVER = '.edge/next-build';

  // INIT FOLDER CUSTOM SERVER
  const CUSTOM_SERVER_DIR = 'custom-server';
  const CURRENT_VERSION = nextVersion;
  const filePath = path.resolve(getAbsoluteDirPath(import.meta.url, 'presets'), 'src');
  const customServerPath = join(filePath, 'presets', 'next', 'node', CUSTOM_SERVER_DIR, CURRENT_VERSION);
  const rootDir = process.cwd();
  // try version dir
  const outPathCustomServer = path.resolve(OUT_DIR_CUSTOM_SERVER, 'custom-server');
  try {
    copyDirectory(customServerPath, outPathCustomServer);
  } catch (error) {
    feedback.prebuild.error(`Custom server path not found for version ${CURRENT_VERSION}!`);
    fs.rmSync(OUT_DIR_CUSTOM_SERVER, { recursive: true });
    process.exit(1);
  }

  // It is necessary to replace the static directories for the .vercel output,
  // which has the _next pattern and the public folder does not exist
  // as the files are in the root (.vercel/output/static).
  const buildStatic = new BuildStatic({
    rootDir,
    includeDirs: ['./.next', './public'],
    staticDirs: [
      { name: './public', replace: '/' },
      { name: './.next/static', replace: './_next/static' },
    ],
    excludeDirs: ['./.next/cache', 'node_modules'],
    out: OUT_DIR_CUSTOM_SERVER,
    versionId: buildContext.buildId,
  });

  buildStatic.run();
}

export default run;
