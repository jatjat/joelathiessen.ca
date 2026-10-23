const path = require("path");
const nodeExternals = require("webpack-node-externals");

module.exports = {
  target: "node",
  node: {
    __dirname: false
  },
  entry: {
    main: "./src/server.ts"
  },
  externals: [nodeExternals()],
  output: {
    path: path.join(__dirname, "dist"),
    filename: "server.bundle.js"
  },
  resolve: {
    extensions: [".ts", ".tsx"],
    modules: ["node_modules"]
  },
  module: {
    rules: [{ test: /.tsx?$/, use: ["awesome-typescript-loader"] }]
  },
  devtool: "inline-source-map"
};
