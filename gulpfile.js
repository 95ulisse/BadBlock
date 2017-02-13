'use strict';

var path = require('path'),
    gulp = require('gulp'),
    gutil = require('gulp-util'),
    eslint = require('gulp-eslint'),
    minifyHtml = require('gulp-html-minifier'),
    jsonminify = require('gulp-json-minify'),
    webpack = require('webpack'),
    webpackStream = require('webpack-stream'),
    WebpackDevServer = require('webpack-dev-server');

var webpackConfig = require('./webpack.config');

// Default task
gulp.task('default', [ 'build' ]);

// -----------------------------------------------------------
// Main tasks
// -----------------------------------------------------------

gulp.task('lint', function () {
    return gulp.src(['./src/**/*.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('serve', [], function () {

    // Debug mode specific settings
    const port = 8080;
    webpackConfig.debug = true;
    webpackConfig.devtool = 'inline-source-map';

    // Starts the dev server
    new WebpackDevServer(webpack(webpackConfig), {
        contentBase: path.join(__dirname, 'src'),
        stats: { colors: true }
    })
    .listen(port, 'localhost', function (e) {
        if (e)
            throw new gutil.PluginError('WebpackDevServer', e.message);
        gutil.log('[WebpackDevServer]', `Listening on port ${port}`);
    });

});

gulp.task('build', [ 'build-js', 'build-html', 'build-static-assets', 'build-static-json' ]);

gulp.task('build-js', function () {

    // Release specific webpack config
    webpackConfig.plugins.push(new webpack.DefinePlugin({
        'process.env': {
            NODE_ENV: JSON.stringify('production')
        }
    }));
    webpackConfig.plugins.push(new webpack.optimize.UglifyJsPlugin());

    return gulp.src('./src/index.js')
        .pipe(webpackStream(webpackConfig))
        .pipe(gulp.dest('./out'));
});

gulp.task('build-html', function () {
    return gulp.src('./src/index.html')
        .pipe(minifyHtml({
            removeIgnored: false,
            removeComments: true,
            removeCommentsFromCDATA: true,
            removeCDATASectionsFromCDATA: true,
            collapseWhitespace: true,
            conservativeCollapse: false,
            collapseBooleanAttributes: true,
            removeAttributeQuotes: true,
            removeRedundantAttributes: true,
            useShortDoctype: true,
            removeEmptyAttributes: true,
            removeEmptyElements: false,
            removeOptionalTags: true,
            removeScriptTypeAttributes: false,
            removeStyleLinkTypeAttributes: false,
            caseSensitive: false,
            keepClosingSlash: false,
            minifyJS: true,
            processScripts: false,
            minifyCSS: true,
            minifyURLs: false,
            lint: false
        }))
        .pipe(gulp.dest('./out'));
});

gulp.task('build-static-assets', function () {
    return gulp.src([
        './src/assets/*.{mp3,png,jpg}'
        ])
        .pipe(gulp.dest('./out/assets'));
});

gulp.task('build-static-json', function () {
    return gulp.src([
        './src/assets/*.json'
        ])
        .pipe(jsonminify())
        .pipe(gulp.dest('./out/assets'));
});
