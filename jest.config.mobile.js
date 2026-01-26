/**
 * Jest configuration for React Native (mobile client) tests
 */

module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/client/**/*.test.{js,jsx,ts,tsx}'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.mobile.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/client/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1',
  },
  collectCoverageFrom: [
    'client/**/*.{js,jsx,ts,tsx}',
    '!client/**/*.d.ts',
    '!client/index.js',
    '!client/__tests__/**',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/.expo/',
    '/dist/',
  ],
};
