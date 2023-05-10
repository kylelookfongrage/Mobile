// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const blacklist = require('metro-config/src/defaults/exclusionList');


module.exports = {
    ...getDefaultConfig(__dirname),
    resolver: {
    blacklistRE: blacklist([/#current-cloud-backend\/.*/]),
  },
};
