/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  displayName: 'Unenv Preset',
  preset: 'ts-jest',
  transform: {
    '^.+\\.(t|j)s?$': 'ts-jest',
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  testEnvironment: 'node',
};
