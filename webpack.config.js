const path = require('path');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {

  plugins: [
    new UglifyJSPlugin()
  ],

  entry: "./build/index.js",

  output: {
    path: __dirname + "/dist",
    filename: "main.js",
  },

  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        include: [
          path.resolve(__dirname, './lib')
        ],
        loader: 'babel-loader',
        query: {
          presets: [
            'es2015',
            'react',
            'stage-0'
          ]
        }
      }
    ]
  },

  stats: {
    colors: true
  },

  devtool: 'source-map'
};
