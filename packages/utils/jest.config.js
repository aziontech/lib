/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  displayName: 'Utils',
  preset: 'ts-jest',
  transform: {
    '^.+\\.(t|j)s?$': 'ts-jest',
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  testEnvironment: 'node',
};
