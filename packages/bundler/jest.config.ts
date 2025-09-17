import path from 'path';
import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
  displayName: 'Bundler',
  clearMocks: true,
  coverageProvider: 'v8',
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
  testPathIgnorePatterns: ['node_modules/'],
  moduleNameMapper: {
    '^azion/config$': path.resolve(__dirname, '../config/src/index.ts'),
    '^azion/config/rules$': path.resolve(__dirname, '../config/src/rules/index.ts'),
    '^azion/config/(.*)$': path.resolve(__dirname, '../config/src/$1'),
    '^azion/presets$': path.resolve(__dirname, '../presets/src/index.ts'),
    '^azion/presets/(.*)$': path.resolve(__dirname, '../presets/src/$1'),
    '^azion/utils$': path.resolve(__dirname, '../utils/src/index.ts'),
    '^azion/utils/node$': path.resolve(__dirname, '../utils/src/node/index.ts'),
    '^azion/utils/edge$': path.resolve(__dirname, '../utils/src/edge/index.ts'),
    '^azion/utils/(.*)$': path.resolve(__dirname, '../utils/src/$1'),
    '^azion/unenv-preset$': path.resolve(__dirname, '../unenv-preset/src'),
    '^azion/unenv-preset/(.*)$': path.resolve(__dirname, '../unenv-preset/src/$1'),
    '^azion/types$': path.resolve(__dirname, '../types/src/index.ts'),
    '^azion/types/(.*)$': path.resolve(__dirname, '../types/src/$1'),
  },
  transform: {
    '^.+\\.ts?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  extensionsToTreatAsEsm: ['.ts'],
  transformIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/packages/unenv-preset/'],
  moduleDirectories: ['node_modules', path.resolve(__dirname, '..')],
  roots: [path.resolve(__dirname, 'src')],
  modulePaths: [path.resolve(__dirname, '..')],
};

export default config;
