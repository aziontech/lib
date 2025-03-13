import { LockFileMap, PackageManagerType } from './types';

export const PACKAGE_MANAGERS: PackageManagerType[] = ['npm', 'yarn', 'pnpm', 'npx'];

export const LOCK_FILES: LockFileMap = {
  yarn: {
    fileName: 'yarn.lock',
    pmType: 'yarn',
  },
  npm: {
    fileName: 'package-lock.json',
    pmType: 'npm',
  },
  pnpm: {
    fileName: 'pnpm-lock.yaml',
    pmType: 'pnpm',
  },
};

export const DEFAULT_PACKAGE_MANAGER: PackageManagerType = 'npx';
