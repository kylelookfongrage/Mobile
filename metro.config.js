// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const blacklist = require('metro-config/src/defaults/exclusionList');

module.exports = (() => {
  const defaultConfig = getDefaultConfig(__dirname);
  const {assetExts} = defaultConfig.resolver;
  return {
    resolver: {
      blacklistRE: blacklist([/#current-cloud-backend\/.*/]),
      // Add bin to assetExts
      assetExts: [...assetExts, 'bin'],
    }
  };
})();
