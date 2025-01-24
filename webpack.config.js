const path = require("path")
const packageJson = require("./package.json")
const webpack = require("webpack")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const CopyWebpackPlugin = require("copy-webpack-plugin")
const {CleanWebpackPlugin} = require("clean-webpack-plugin")

module.exports = {
  entry: "./src/demo.ts",
  devtool: "source-map",
  mode: "development",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      },
      {
        test: /\.css?$/,
        use: ["style-loader", "css-loader", "postcss-loader"]
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    libraryTarget: "umd",
    library: 'WinBox-TypeScript',
    umdNamedDefine: true
  },
  devServer: {
    open: false,
    port: 3000,
    static: path.join(__dirname, "dist"),
    liveReload: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      applicationVersion: packageJson.version,
      inject: true
    }),
    new webpack.DefinePlugin({
      applicationVersion: JSON.stringify(packageJson.version)
    }),
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "public"),
          to: path.resolve(__dirname, "dist"),
          globOptions: {
            ignore: ["**/index.html"] // Ignore index.html to prevent conflicts.
          }
        }
      ]
    })
  ]
}
