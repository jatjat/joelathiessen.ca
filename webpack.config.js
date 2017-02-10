var path = require('path');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var webpack = require('webpack');

var isProd = process.env.NODE_ENV === 'production';

function getEntrySources(sources) {
    if (!isProd) {
        sources.push('webpack-dev-server/client?http://localhost:8080');
        sources.push('webpack/hot/only-dev-server');
    } else {
        console.log("Running in production...");
    }

    return sources;
}

module.exports = {
    entry: {
        clientApp: getEntrySources([
            './js/root.js'
        ])
    },
    output: {
        publicPath: '/',
        filename: 'public/[name].js',
        sourceMapFileName: "[name].js.map"
    },
    module: 
    {
        loaders:
            [
                {
                    test: /\.js$/,
                    loaders: isProd ? ['jsx', 'babel'] : ['react-hot','jsx', 'babel'],
                    exclude: /node_modules///,
                },
                { 
                    test: /\.(scss)$/, loaders: ['style', 'css', 'sass'] 
                },
                {
                    test: /\.(png|jpg|jpeg)$/, loader: 'url-loader?limit=32768',
                }
	    ]
	},
    plugins: isProd ? [
        new CopyWebpackPlugin([{
            from: "node_modules/pdfjs-dist/build/pdf.worker.js",
            to: "/public/appClient.worker.js"
        }]),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin({ compress: {
            drop_console: true,
            warnings: false
        } })
    ] : []
};
