const path = require("path");
const webpack = require("webpack");
const merge = require("webpack-merge");
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
const common = require("./webpack.common.js");
module.exports = merge(common, {
  output: {
    path: path.join(__dirname, "./dist/"),
    filename: "[name].bundle.js"
  },
  watch: false
});
