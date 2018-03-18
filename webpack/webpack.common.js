const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: {
    main: "./src/frontend/root.tsx"
  },
  output: {
    path: path.join(__dirname, "../dist/"),
    filename: "[name].bundle.js"
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".html"]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/backend/index.html"
    })
  ],
  module: {
    rules: [
      { test: /.tsx?$/, use: ["awesome-typescript-loader"] },
      { test: /.html$/, use: "raw-loader" },
      { test: /\.json$/, use: "json-loader" },
      {
        test: /\.(s*)css$/,
        use: ["style-loader", "css-loader", "sass-loader"]
      },
      {
        test: /\.woff(\?.+)?$/,
        use: "url-loader?limit=10000&mimetype=application/font-woff"
      },
      {
        test: /\.woff2(\?.+)?$/,
        use: "url-loader?limit=10000&mimetype=application/font-woff"
      },
      { test: /\.ttf(\?.+)?$/, use: "file-loader" },
      { test: /\.eot(\?.+)?$/, use: "file-loader" },
      { test: /\.svg(\?.+)?$/, use: "file-loader" },
      { test: /\.png$/, use: "url-loader?mimetype=image/png" },
      { test: /\.gif$/, use: "url-loader?mimetype=image/gif" }
    ]
  }
};
