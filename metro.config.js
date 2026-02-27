const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

const SHIM_PATH = path.resolve(
  __dirname,
  "client/lib/reanimated-web-shim.js"
);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // On web: redirect react-native-reanimated → our shim
  // EXCEPT when the import comes from our shim itself (to avoid infinite recursion)
  if (
    platform === "web" &&
    moduleName === "react-native-reanimated" &&
    context.originModulePath !== SHIM_PATH
  ) {
    return { type: "sourceFile", filePath: SHIM_PATH };
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
