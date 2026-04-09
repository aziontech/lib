import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
  displayName: 'Presets',
  clearMocks: true,
  coverageProvider: 'v8',
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
  testPathIgnorePatterns: ['node_modules/'],
  // moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
  transform: {
    '^.+\\.ts?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  extensionsToTreatAsEsm: ['.ts'],
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
};

export default config;
