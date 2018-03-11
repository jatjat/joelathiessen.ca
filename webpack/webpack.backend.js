const path = require("path");
const nodeExternals = require("webpack-node-externals");
const WriteFilePlugin = require("write-file-webpack-plugin");

module.exports = {
  target: "node",
  node: {
    __dirname: false
  },
  entry: {
    main: "./src/backend.ts"
  },
  externals: [nodeExternals()],
  output: {
    path: path.join(__dirname, "../dist/"),
    filename: "backend.bundle.js"
  },
  resolve: {
    extensions: [".ts", ".tsx"],
    modules: ["./node_modules", "node_modules"]
  },
  module: {
    loaders: [{ test: /.tsx?$/, use: ["awesome-typescript-loader"] }]
  },
  devtool: "inline-source-map",
  plugins: [new WriteFilePlugin()]
};
