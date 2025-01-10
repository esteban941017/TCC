module.exports = {
  transform: { '^.+\\.ts?$': ['ts-jest', { tsconfig: 'tsconfig.json' }] },
  testEnvironment: 'node',
  testRegex: '/test/.*\\.(test|spec)?\\.(ts|tsx)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapper: {
    '^/src/(.*)': '<rootDir>/src/$1',
  },
  coverageDirectory: 'coverage',
  coverageReporters: ['json', 'text', 'lcov', 'clover'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  maxWorkers: '50%',
  testTimeout: 150000,
  setupFiles: ['<rootDir>/test/setup.ts'],
};
