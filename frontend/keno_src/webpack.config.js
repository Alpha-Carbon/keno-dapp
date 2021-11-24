const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const dist = path.resolve(__dirname, "dist");

module.exports = {
  entry: "./js/index.js",
  output: {
    path: dist,
    filename: "bundle.js",
    library: "keno"
  },
  devServer: {
    contentBase: dist,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html'
    }),

  ],
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'img/[name].[ext]',
              outputPath: 'assets'
            },
          },
        ],
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac|m4a)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'sound/[name].[ext]',
              outputPath: 'assets'
            },
          },
        ],
      },
    ],
  }
};
