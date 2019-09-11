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
const HtmlWebpackPlugin = require('html-webpack-plugin');

console.log("Webpack", process.env.environment, 'dist', __dirname + "/dist");

module.exports = {
    mode: process.env.environment,

    entry: "./build/index.js",

    plugins: [
        new HtmlWebpackPlugin({
            title: 'Output Management',
            filename: "index.html",
            template: "src/index.html",
            inject: "body",
            //chunksSortMode: "dependency",
            chunks: ['main'],
            //excludeChunks: ['departureboards']
        })
    ],

    output: {
        path: __dirname + "/dist",
        //filename: "[name].js",
        //chunkFilename: '[name]-bundle.js',
        //filename: '[name].[hash:5].js',
        filename: '[hash:5]/[hash:5].js',
        chunkFilename: '[hash:5]/[hash:5]-[id].js',
        publicPath: "/"
    },

    optimization: {
        moduleIds: 'hashed',
        // Have a single webpack runtime used by all chunks
        runtimeChunk: "single",
        // Name chunks
        namedChunks: true,
        splitChunks: {
            chunks: 'async',
            minSize: 30000,
            maxSize: 90000,
            minChunks: 1,
            maxAsyncRequests: 5,
            maxInitialRequests: 3,
            automaticNameDelimiter: '~',
            automaticNameMaxLength: 30,
            name: true,
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10
                },
                default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true
                }
            }
        }
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
                        'env',
                        'react'
                    ]
                }
            },
            {
                test: /\.svg$/,
                exclude: /(node_modules|bower_components)/,
                include: [
                    path.resolve(__dirname, './src')
                ],
                loader: 'svg-inline-loader'
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
        contentBase: 'dist',
        // Disable compilation by requesting it only on a non-existent file.
        // This is needed so that we use what's deployed under dist & not a virtual copy
        lazy: true,
        filename: "donotrecompile.js",
        // Compression
        compress: false
    }
};
