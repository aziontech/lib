/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  moduleNameMapper: {
    './photon/lib/index': '<rootDir>/__mocks__/photonLib.ts',
  },
  transform: {
    '^.+\\.(t|j)s?$': 'ts-jest',
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  testEnvironment: 'node',
};
