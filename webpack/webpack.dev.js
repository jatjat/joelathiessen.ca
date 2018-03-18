const merge = require("webpack-merge");
const common = require("./webpack.common.js");
const WriteFilePlugin = require("write-file-webpack-plugin");

module.exports = merge(common, {
  devServer: {
    contentBase: "./public",
    port: 8080,
    proxy: {
      "/img": {
        target: "http://localhost:3000"
      },
      "/css": {
        target: "http://localhost:3000"
      },
      "/public": {
        target: "http://localhost:3000"
      },
      "/socket.io": {
        target: "http://localhost:3000",
        ws: true
      }
    }
  },
  watch: true,
  devtool: "inline-source-map"
});
