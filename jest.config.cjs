/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['<rootDir>/test/**/*.test.[jt]s?(x)'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^#controllers/(.*)$': '<rootDir>/controllers/$1',
    '^#tools/(.*)$': '<rootDir>/tools/$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'controllers/**/*.ts',
    'tools/**/*.ts',
    '!**/node_modules/**',
    '!**/test/**'
  ],
};
