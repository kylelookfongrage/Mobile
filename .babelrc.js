module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo", '@babel/preset-flow'],
    plugins: [
      [
        "@tamagui/babel-plugin",
        {
          components: ["tamagui"],
          config: "./tamagui.config.ts",
          logTimings: true,
        },
      ],
      ["transform-inline-environment-variables"],
      ["@babel/plugin-syntax-flow"],
      [
        "module:react-native-dotenv",
        {
          moduleName: "@env",
          path: ".env",
          blacklist: null,
          whitelist: null,
          safe: false,
          allowUndefined: false,
        },
      ],
      ["react-native-reanimated/plugin"],
    ],
  };
};
