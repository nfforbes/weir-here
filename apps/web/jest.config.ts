import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

// Base config for component tests (jsdom via next/jest pipeline)
const baseConfig: Config = {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@weir-here/shared$': '<rootDir>/../../packages/shared/src/index.ts',
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/', '<rootDir>/src/__tests__/api/'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};

// API route tests — run in node environment with ts-jest (bypass Next.js Babel transform)
const apiNodeProject: Config = {
  displayName: 'api-node',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/__tests__/api/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@weir-here/shared$': '<rootDir>/../../packages/shared/src/index.ts',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json', diagnostics: false }],
  },
  // Tell ts-jest not to skip node_modules transform for next/server
  transformIgnorePatterns: [],
};

// Merge: next/jest wraps baseConfig; apiNodeProject runs standalone
export default async () => {
  const nextConfig = await createJestConfig(baseConfig)();
  return {
    ...nextConfig,
    projects: [
      // Component / lib tests (uses next/jest transforms + jsdom)
      { ...nextConfig, displayName: 'components-jsdom', testMatch: ['<rootDir>/src/__tests__/*.test.ts', '<rootDir>/src/__tests__/**/*.test.tsx'] },
      // Admin API route tests (node environment, ts-jest)
      apiNodeProject,
    ],
  };
};
