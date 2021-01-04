const path = require("path");

module.exports = {
  entry: {
    content: path.resolve(__dirname, "./src/content.js"),
    background: path.resolve(__dirname, "./src/background.js"),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ["babel-loader", "eslint-loader"],
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
};
