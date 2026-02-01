module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./client",
            "@shared": "./shared",
          },
          extensions: [".ios.js", ".android.js", ".js", ".ts", ".tsx", ".json"],
        },
      ],
      "react-native-reanimated/plugin",
      // Remove console.logs in production (except error and warn)
      process.env.NODE_ENV === "production" && [
        "transform-remove-console",
        { exclude: ["error", "warn"] },
      ],
    ].filter(Boolean),
  };
};
