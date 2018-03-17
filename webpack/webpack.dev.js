const merge = require("webpack-merge");
const common = require("./webpack.common.js");
const WriteFilePlugin = require("write-file-webpack-plugin");

module.exports = merge(common, {
  devServer: {
    contentBase: "./",
    port: 8080
  },
  watch: true,
  devtool: "inline-source-map",
  plugins: [new WriteFilePlugin()] // for PDF.js
});
