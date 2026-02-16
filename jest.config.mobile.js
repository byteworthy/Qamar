/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  testEnvironment: "node",
  roots: ["<rootDir>/client"],
  testMatch: ["**/__tests__/**/*.test.{ts,tsx,js,jsx}"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],

  // Transform settings for React Native
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)",
  ],

  // Module name mapping for absolute imports
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/client/$1",
    "^@shared/(.*)$": "<rootDir>/shared/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },

  // Setup files
  setupFilesAfterEnv: [
    "@testing-library/jest-native/extend-expect",
    "<rootDir>/client/__tests__/setup.ts",
  ],

  // Coverage settings
  collectCoverageFrom: [
    "client/**/*.{ts,tsx}",
    "!client/**/*.test.{ts,tsx}",
    "!client/__tests__/**",
    "!client/index.js",
    "!client/**/*.d.ts",
  ],

  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Globals
  globals: {
    "ts-jest": {
      tsconfig: {
        jsx: "react",
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    },
  },
};
