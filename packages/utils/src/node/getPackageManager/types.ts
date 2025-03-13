export type PackageManagerType = 'npm' | 'yarn' | 'pnpm' | 'npx';

export interface PackageManagerOptions {
  cwd?: string;
}

export interface LockFileMap {
  [key: string]: {
    fileName: string;
    pmType: PackageManagerType;
  };
}
