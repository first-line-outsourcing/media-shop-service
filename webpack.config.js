const path = require('path');
const WebpackShellPlugin = require('webpack-shell-plugin');
const slsw = require('serverless-webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const destPath = path.join(__dirname, '.webpack');

module.exports = {
  mode: 'development',
  entry: slsw.lib.entries,
  output: {
    libraryTarget: 'commonjs',
    path: destPath,
    filename: '[name].js'
  },
  target: 'node',
  module: {
    rules: [
      { test: /\.ts(x?)$/, loader: 'ts-loader', exclude: [/\.(spec|e2e)\.ts$/] }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: path.join(__dirname, "wkhtmltopdf")
      }
    ]),
    new WebpackShellPlugin({
      onBuildEnd: [`chmod 755 ${destPath}/service/wkhtmltopdf`]
    })
  ]
};
