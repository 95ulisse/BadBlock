var path = require('path'),
    webpack = require('webpack'),
    ExtractTextPlugin = require('extract-text-webpack-plugin'),
    autoprefixer = require('autoprefixer');

module.exports = {
    context: path.join(__dirname, 'src'),
    entry: {
        badblock: [ './index.js' ]
    },
    output: {
        path: path.join(__dirname, 'out'),
        publicPath: '/',
        filename: '[name].js',
        libraryTarget: 'umd',
        library: 'badblock'
    },
    resolve: {
        root: path.join(__dirname, 'out'),
        extensions: ['', '.js'],
        modulesDirectories: ['node_modules']
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules\/(?!phy6)/,
                loaders: [ 'babel' ]
            },
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract([
                    'css?modules&importLoaders=1&localIdentName=[name]__[local]__[hash:base64:5]',
                    'postcss',
                    'sass'
                ].join('!'))
            }
        ],
    },
    plugins: [
        new webpack.NoErrorsPlugin(),
        new ExtractTextPlugin('[name].css')
    ],
    postcss: [
        autoprefixer({
            browsers: [ 'last 2 versions' ]
        })
    ],
    sassLoader: {
        includePaths: [ path.resolve(__dirname, "./src/css") ]
    }
};
