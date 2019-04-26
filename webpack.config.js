const path = require('path');
const webpack = require('webpack');
/*
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

var plugins = []
// If we are a production build then this will uglify it and remove the
// react development tools from the build
if( process.env.environment == 'production' ) {
  plugins = [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify( 'production' )
    }),
    new UglifyJSPlugin()
  ]
}
*/
console.log( "Webpack", process.env.environment, 'dist', __dirname + "/dist" );

module.exports = {
  mode: process.env.environment,

  //plugins: plugins,

  entry: "./build/index.js",

  output: {
    path: __dirname + "/dist",
    filename: "main.js",
  },

  module: {
    // This used to be called loaders but recent webpack requires rules instead
    rules: [
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

  devtool: 'source-map',

  devServer: {
    /*open: 'http://localhost:9000',*/
    port: 9000,
    contentBase: 'dist'
  }
};
