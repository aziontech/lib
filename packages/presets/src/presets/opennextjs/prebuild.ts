import { BuildConfiguration, BuildContext } from 'azion/config';
import { exec } from 'azion/utils/node';
import { readFile } from 'fs/promises';
import path from 'path';

/**
 * Runs custom prebuild actions for OpenNextjs
 */
async function prebuild(buildConfig: BuildConfiguration, ctx: BuildContext): Promise<void> {
  const pkgOpenNextjsName = '@aziontech/opennextjs-azion';
  const openNextjsCommand = 'npm exec opennextjs-azion';

  // Check if the OpenNextjs Azion is installed
  const isOpenNextjsInstalled = await checkIfOpenNextjsIsInstalled();
  if (!isOpenNextjsInstalled) {
    const packageManager = await indentifyPackageManager();
    const execCommand =
      packageManager === 'yarn'
        ? `yarn add -D ${pkgOpenNextjsName}`
        : packageManager === 'pnpm'
          ? `pnpm add -D ${pkgOpenNextjsName}`
          : `npm i -D ${pkgOpenNextjsName}`;
    await exec(execCommand, {
      scope: 'OpenNextjs',
      verbose: true,
      interactive: true,
    });
  }
  // Run OpenNextjs command build
  const skipBuild = ctx.skipFrameworkBuild ? '--skipBuild' : '';
  await exec(`${openNextjsCommand} build -- ${skipBuild}`, {
    scope: 'OpenNextjs',
    verbose: true,
    interactive: true,
  });
  await exec(`${openNextjsCommand} populateAssets`, {
    scope: 'OpenNextjs',
    verbose: true,
  });
  await exec(`${openNextjsCommand} populateCache`, {
    scope: 'OpenNextjs',
    verbose: true,
  });
}

async function checkIfOpenNextjsIsInstalled(): Promise<boolean> {
  const packageJsonPath = path.resolve(process.cwd(), 'package.json');
  const packageJson = await readFile(packageJsonPath, 'utf-8');
  const packageJsonObj = JSON.parse(packageJson);
  if (!packageJsonObj.devDependencies || !packageJsonObj.devDependencies['@aziontech/opennextjs-azion']) {
    return false;
  }
  return true;
}

async function indentifyPackageManager(): Promise<string> {
  const lockFiles = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'];
  for (const lockFile of lockFiles) {
    const filePath = path.resolve(process.cwd(), lockFile);
    try {
      await readFile(filePath, 'utf-8');
      return lockFile.includes('yarn') ? 'yarn' : lockFile.includes('pnpm') ? 'pnpm' : 'npm';
    } catch {
      // File not found, continue to the next one
    }
  }
  return 'npm'; // Default to npm if no lock file is found
}

export default prebuild;
