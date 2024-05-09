const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  return {
    ...config, node: {
      fs: "empty"
    },
    externals: {
        "react-native": true,
    },
  };
};