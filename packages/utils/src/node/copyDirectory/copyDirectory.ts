import { copyFileSync, existsSync, lstatSync, mkdirSync, readdirSync } from 'fs';
import { join, resolve } from 'path';

/**
 * @function
 * @memberof Utils
 * @description Recursively copies a directory to the target directory, excluding any files or directories
 * that would result in the target directory being copied into itself.
 * subdirectory of the source directory, this function will avoid copying the target directory into
 * itself.
 * @example
 * // Copy a directory to the target directory
 * copyDirectory('path/to/source', 'path/to/target');
 * @example
 * // If the target directory is a subdirectory
 * of the source directory, this function will avoid copying the target directory into itself
 * copyDirectory('path/to/source', 'path/to/source/subdirectory');
 */
function copyDirectory(source: string, target: string, ignoreFiles?: string[]) {
  const absoluteSource = resolve(source);
  const absoluteTarget = resolve(target);

  // Do not copy if source and target are the same
  if (absoluteSource === absoluteTarget) {
    return;
  }

  if (!existsSync(absoluteTarget)) {
    mkdirSync(absoluteTarget, { recursive: true });
  }

  const files = readdirSync(absoluteSource);

  for (const file of files) {
    const current = join(absoluteSource, file);
    const target = join(absoluteTarget, file);

    if (ignoreFiles && ignoreFiles.length > 0) {
      if (ignoreFiles.includes(file)) {
        continue;
      }
    }

    // If the target path is a subdirectory of the source path, skip copying
    if (target.startsWith(current)) {
      continue;
    }
    if (lstatSync(current).isDirectory()) {
      copyDirectory(current, target);
    } else {
      copyFileSync(current, target);
    }
  }
}

export default copyDirectory;
