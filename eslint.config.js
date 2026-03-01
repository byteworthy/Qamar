// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const eslintPluginPrettierRecommended = require("eslint-plugin-prettier/recommended");

module.exports = defineConfig([
  {
    ignores: [
      "dist/**",
      "build/**",
      "static-build/**",
      "server_dist/**",
      "web/**",
      "e2e/**",
      "scripts/**",
      ".agents/**",
      ".claude/**",
      ".gemini/**",
      ".opencode/**",
      "anthropic-cookbook/**",
      "archive/**",
      "node_modules/**",
    ],
  },
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    rules: {
      "prettier/prettier": ["error", { endOfLine: "auto" }],
    },
  },
]);
