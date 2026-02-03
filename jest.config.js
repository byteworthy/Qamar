/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/server"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  collectCoverageFrom: [
    "server/**/*.ts",
    "!server/**/*.test.ts",
    "!server/__tests__/**",
  ],
  coverageThreshold: {
    global: {
      statements: 50,
      branches: 38,
      functions: 44,
      lines: 50,
    },
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^@shared/(.*)$": "<rootDir>/shared/$1",
  },
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: {
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
        },
      },
    ],
  },
};
