module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  collectCoverage: true,
  collectCoverageFrom: ['**/*.{js,ts}', '!**/node_modules/**'],
  coverageDirectory: 'coverage',
  // SOLO ts, nunca js
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  moduleNameMapper: {
    '^#controllers/(.*)$': '<rootDir>/controllers/$1',
    '^#tools/(.*)$': '<rootDir>/tools/$1'
  },
  // quita esto si no usas ESM en tests
  // extensionsToTreatAsEsm: ['.ts'],
  moduleFileExtensions: ['js', 'ts'],
  testEnvironmentOptions: { url: 'http://localhost/' }
};