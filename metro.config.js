const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  "@react-native-masked-view/masked-view": require.resolve("@react-native-masked-view/masked-view"),
};
module.exports = config;