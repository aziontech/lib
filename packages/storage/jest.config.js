/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  displayName: 'Storage',
  preset: 'ts-jest',
  transform: {
    '^.+\\.(t|j)s?$': '@swc/jest',
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  testEnvironment: 'node',
};
