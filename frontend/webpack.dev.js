const path = require("path");
const merge = require("webpack-merge");
const common = require("./webpack.common.js");
module.exports = merge(common, {
  output: {
    path: path.join(__dirname, "../backend/dist/"),
    filename: "[name].bundle.js"
  },
  devServer: {
    contentBase: "../backend/public",
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
