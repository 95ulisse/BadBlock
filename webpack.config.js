var path = require('path'),
    webpack = require('webpack');

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
            }
        ],
    },
    plugins: [
        new webpack.NoErrorsPlugin()
    ],
};
