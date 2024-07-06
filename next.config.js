const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");

module.exports = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins.push(
        new CopyWebpackPlugin({
          patterns: [
            {
              from: path.resolve(
                __dirname,
                "node_modules/tiktoken/tiktoken_bg.wasm"
              ),
              to: path.resolve(__dirname, ".next/server/wasm"),
            },
          ],
        })
      );
    }
    return config;
  },
};
