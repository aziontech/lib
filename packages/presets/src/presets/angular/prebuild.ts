import { exec, getPackageManager, type PackageManagerType } from 'azion/utils/node';
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
 * Runs custom prebuild actions for Angular
 */
async function prebuild(): Promise<void> {
  const packageManager: PackageManagerType = await getPackageManager();
  const npmArgsForward: string = packageManager === 'npm' ? '--' : '';

  await exec(`${packageManager} run build ${npmArgsForward} --output-path=./dist`, {
    scope: 'Angular',
    verbose: true,
  });

  const browserFolder: string = path.join(process.cwd(), 'dist', 'browser');

  try {
    await fs.access(browserFolder);
    await moveBrowserFiles(browserFolder, path.join(process.cwd(), 'dist'));
  } catch {
    // Browser folder doesn't exist, nothing to move
  }
}

export default prebuild;
