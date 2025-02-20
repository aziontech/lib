import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { DEFAULT_PACKAGE_MANAGER, LOCK_FILES } from './constants';
import { PackageManagerOptions, PackageManagerType } from './types';

/**
 * @function
 * @memberof Utils
 * @description Checks if a path exists.
 * @param {string} p - The path to check.
 * @returns {Promise<boolean>} A Promise that resolves to `true`
 * if the path exists, `false` otherwise.
 */
const pathExists = async (p: string): Promise<boolean> => {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
};

const cache: Map<string, string | boolean | null> = new Map();

/**
 * @function
 * @memberof Utils
 * @description Check if a global package manager (PM) is available.
 * @param {string} pm - The package manager to check (e.g., "npm", "yarn", "pnpm").
 * @returns {Promise<boolean>} A Promise that resolves to true if the global PM is available,
 * false otherwise.
 */
const hasGlobalInstallation = async (pm: PackageManagerType): Promise<boolean> => {
  const key = `has_global_${pm}`;
  if (cache.has(key)) {
    return cache.get(key) as boolean;
  }

  return new Promise((resolve) => {
    exec(`${pm} --version`, (error, stdout) => {
      const isAvailable = !error && /^\d+\.\d+\.\d+$/.test(stdout.trim());
      cache.set(key, isAvailable);
      resolve(isAvailable);
    });
  });
};

/**
 * @function
 * @memberof Utils
 * @description Get the type of lock file (npm, yarn, pnpm) in a specific directory.
 * @param {string} [cwd] - The directory to check. Defaults to the current working directory.
 * @returns {Promise<string|null>} A Promise that resolves to the type of lock file
 * (npm, yarn, pnpm), or null if no lock file is found.
 */
const getTypeofLockFile = async (cwd: string = '.'): Promise<PackageManagerType | null> => {
  const key = `lockfile_${cwd}`;

  if (cache.has(key)) {
    return cache.get(key) as PackageManagerType | null;
  }

  const lockFileChecks = await Promise.all(
    Object.values(LOCK_FILES).map(async ({ fileName, pmType }) => ({
      exists: await pathExists(path.resolve(cwd, fileName)),
      pmType,
    })),
  );

  const foundLockFile = lockFileChecks.find(({ exists }) => exists);
  const value = foundLockFile ? foundLockFile.pmType : null;

  cache.set(key, value);
  return value;
};

/**
 * @function
 * @memberof Utils
 * @description Detects the package manager being used.
 * @param {object} options - Options for detecting the package manager.
 * @param {string} [options.cwd] - The directory to check.
 * Defaults to the current working directory.
 * @returns {Promise<string>} A Promise that resolves to the detected
 *  package manager (npm, yarn, pnpm).
 * @example
 *
 * // Example usage:
 * getPackageManager({ cwd: './my-project' })
 *   .then(pm => console.log(pm)) // Logs: 'yarn', 'npm', or 'pnpm'
 *   .catch(err => console.error(err));
 */
const getPackageManager = async ({ cwd }: PackageManagerOptions = {}): Promise<PackageManagerType> => {
  const type = await getTypeofLockFile(cwd);

  if (type) {
    return type;
  }

  const [hasYarn, hasPnpm] = await Promise.all([hasGlobalInstallation('yarn'), hasGlobalInstallation('pnpm')]);

  if (hasYarn) return 'yarn';
  if (hasPnpm) return 'pnpm';

  return DEFAULT_PACKAGE_MANAGER;
};

export default getPackageManager;
