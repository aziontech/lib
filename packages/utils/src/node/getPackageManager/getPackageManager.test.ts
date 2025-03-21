import { afterEach, beforeEach } from '@jest/globals';
import mockFs from 'mock-fs';
import { LOCK_FILES } from './constants';
import getPackageManager from './index';
import type { PackageManagerType } from './types';

describe('getPackageManager utils', () => {
  beforeEach(() => {
    jest.spyOn(Map.prototype, 'set').mockReturnValue(new Map());
  });

  afterEach(() => {
    mockFs.restore();
  });

  test('Should detect the yarn package manager being used.', async () => {
    mockFs({
      [LOCK_FILES.yarn.fileName]: {
        name: 'next',
        version: '0.1.0',
      },
    });
    const expectedOutput: PackageManagerType = 'yarn';

    const result = await getPackageManager();
    expect(result).toBe(expectedOutput);
  });

  test('Should detect the npm package manager being used.', async () => {
    mockFs({
      [LOCK_FILES.npm.fileName]: {
        name: 'next',
        version: '0.1.0',
      },
    });
    const expectedOutput: PackageManagerType = 'npm';

    const result = await getPackageManager();
    expect(result).toBe(expectedOutput);
  });

  test('Should detect the pnpm package manager being used.', async () => {
    mockFs({
      [LOCK_FILES.pnpm.fileName]: {
        name: 'next',
        version: '0.1.0',
      },
    });
    const expectedOutput: PackageManagerType = 'pnpm';

    const result = await getPackageManager();
    expect(result).toBe(expectedOutput);
  });
});
