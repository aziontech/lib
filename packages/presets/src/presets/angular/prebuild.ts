import { BuildConfiguration, BuildContext } from '@aziontech/config';
import { exec, getPackageManager, type PackageManagerType } from '@aziontech/utils/node';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Move files from browser folder to storage root
 */
async function moveBrowserFiles(browserFolder: string, storagePath: string): Promise<void> {
  try {
    const files: string[] = await fs.readdir(browserFolder);

    await Promise.all(files.map((file) => fs.rename(path.join(browserFolder, file), path.join(storagePath, file))));

    await fs.rmdir(browserFolder);
  } catch (error) {
    console.error('Error moving browser files:', error);
    throw error;
  }
}

/**
 * Find where a previous `ng build` left its output inside the dist folder.
 * A plain `ng build` writes to `dist/<project>` (browser builder) or `dist/<project>/browser`
 * (application builder), while the storage dir expects the files directly in `dist`.
 */
async function findPreviousBuildOutput(outputDir: string): Promise<string | null> {
  const root = path.join(process.cwd(), outputDir);
  const projects = await fs.readdir(root, { withFileTypes: true });

  for (const project of projects.filter((entry) => entry.isDirectory())) {
    for (const candidate of [path.join(root, project.name, 'browser'), path.join(root, project.name)]) {
      try {
        await fs.access(path.join(candidate, 'index.html'));
        return candidate;
      } catch {
        // index.html not found here, try the next candidate
      }
    }
  }

  return null;
}

/**
 * Make sure a previous `ng build` output is at the storage root (dist), like the regular build flow does.
 */
async function prepareSkippedBuild(outputDir: string): Promise<void> {
  const root = path.join(process.cwd(), outputDir);
  await fs.mkdir(root, { recursive: true });

  // Already at the storage root (e.g. built with --output-path=./dist)
  try {
    await fs.access(path.join(root, 'index.html'));
    return;
  } catch {
    // not at the root, look for it inside dist/<project>
  }

  const source = await findPreviousBuildOutput(outputDir);
  if (!source) {
    return;
  }

  await moveBrowserFiles(source, root);

  // remove the project folder left behind when it only contained the browser output
  const projectFolder = path.dirname(source);
  if (projectFolder !== root) {
    await fs.rmdir(projectFolder).catch(() => undefined);
  }
}

/**
 * Runs custom prebuild actions for Angular
 */
async function prebuild(_: BuildConfiguration, ctx: BuildContext): Promise<void> {
  try {
    const outputDir = './dist';
    // If skipFrameworkBuild is true, reuse the output of a previous framework build
    if (ctx.skipFrameworkBuild) {
      await prepareSkippedBuild(outputDir);
      return;
    }
    const packageManager: PackageManagerType = await getPackageManager();
    const npmArgsForward: string = packageManager === 'npm' ? '--' : '';

    await exec(`${packageManager} run build ${npmArgsForward} --output-path=${outputDir}`, {
      scope: 'Angular',
      verbose: true,
    });

    const browserFolder: string = path.join(process.cwd(), outputDir, 'browser');

    try {
      await fs.access(browserFolder);
      await moveBrowserFiles(browserFolder, path.join(process.cwd(), outputDir));
    } catch {
      // Browser folder doesn't exist, nothing to move
    }
  } catch (error) {
    // eslint-disable-next-line preserve-caught-error -- message already embeds the original error
    throw new Error(`Error during Angular prebuild: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export default prebuild;
