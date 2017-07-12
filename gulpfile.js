'use strict';
// include gulp
var gulp = require('gulp'),

    // include plug-ins
    pkg = require('./package.json'),
    jshint = require('gulp-jshint'),
    concat = require('gulp-concat'),
    ngAnnotate = require('gulp-ng-annotate'),
    uglify = require('gulp-uglify'),
    autoprefix = require('gulp-autoprefixer'),
    minifyCSS = require('gulp-minify-css'),
    minifyHTML = require('gulp-minify-html'),
    clean = require('gulp-clean'),
    htmlreplace = require('gulp-html-replace'),
    karma = require('gulp-karma'),
    gulpsync = require('gulp-sync')(gulp),
    imageop = require('gulp-image-optimization'),
    browserSync = require('browser-sync'),
    plug = require('gulp-load-plugins')();
    

// JS hint task
gulp.task('jshint', function () {
    return gulp.src(pkg.paths.jshint)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// Minify the  HTML pages
gulp.task('htmlpage', function () {
    var opts = {
        empty: true,
        comments: true
    };

    gulp.src(pkg.paths.html)
        .pipe(minifyHTML(opts))
        .pipe(gulp.dest(pkg.paths.build));
});


// jsReplace task for automatic injection of script files into the index.
gulp.task('jsReplace', function () {
    gulp.src('./app/index.html')
        .pipe(htmlreplace({
            'js': 'scripts/all.min.js',
            'bowerjs': 'bowerjs/bower.min.js',
            'bowercss': 'bowercss/bower.min.css',
            'contentcss': 'contentcss/content.min.css'
        }))
        .pipe(gulp.dest('build/'));
});

/**
 * Compress images
 * @return {Stream}
 */
gulp.task('images', function () {
    gulp.src(pkg.paths.images)
        .pipe(imageop({
            optimizationLevel: 5,
            progressive: true,
            interlaced: true
        })).pipe(gulp.dest(pkg.paths.image));
});

/**
 * Minify and bundle the app's JavaScript
 * @return {Stream}
 */
gulp.task('js', function () {
    var source = [].concat(pkg.paths.js);
    return gulp
        .src(source)
        .pipe(plug.concat('all.min.js'))
        .pipe(plug.ngAnnotate({
            add: true,
            singleQuotes: true
        }))
        .pipe(plug.uglify({
            mangle: true
        }))
        .pipe(gulp.dest(pkg.paths.scripts));
});




gulp.task('vendorjs', function () {
    var source = [].concat(pkg.paths.vendorjs);
    return gulp
        .src(source)
        .pipe(plug.concat('bower.min.js'))
        .pipe(plug.ngAnnotate({
            add: true,
            singleQuotes: true
        }))
        .pipe(plug.uglify({
            mangle: true
        }))
        .pipe(gulp.dest(pkg.paths.bowerjs));
});


/**
 * Minify and bundle the Vendor CSS
 * @return {Stream}
 */
gulp.task('vendorcss', function () {
    gulp.src(pkg.paths.vendorcss)
        .pipe(plug.concat('bower.min.css'))
        .pipe(plug.autoprefixer('last 2 versions'))
        .pipe(plug.minifyCss({}))
        .pipe(gulp.dest(pkg.paths.bowercss));
});




/**
 * Copy and Minify the Content JavaScript
 * @return {Stream}
 */
gulp.task('contentjs', function () {
    var source = [].concat(pkg.paths.contentjs);
    return gulp
        .src(source)
        .pipe(plug.concat('content.min.js'))
        .pipe(plug.ngAnnotate({
            add: true,
            singleQuotes: true
        }))
        .pipe(plug.uglify({
            mangle: true
        }))
        .pipe(gulp.dest(pkg.paths.contentsjs));
});


/**
 * Minify and bundle the Content CSS
 * @return {Stream}
 */
gulp.task('contentcss', function () {
    gulp.src(pkg.paths.contentcss)
        .pipe(plug.concat('content.min.css'))
        .pipe(plug.autoprefixer('last 2 versions'))
        .pipe(plug.minifyCss({}))
        .pipe(gulp.dest(pkg.paths.contentscss));
});





/**
 * Copy fonts
 * @return {Stream}
 */
gulp.task('icons', function () {
    return gulp.src(pkg.paths.font)
        .pipe(gulp.dest(pkg.paths.fonts));
});




//Gulp clean for cleaning  the build folder 
gulp.task('clean', function () {
    return gulp.src('build', {
            read: false
        })
        .pipe(clean());
});




/**
 * Automate all the tasks
 * @return {Stream}
 */
gulp.task('build', gulpsync.sync(['clean', 'htmlpage', 'js', 'vendorjs', 'vendorcss', 'contentcss', 'images', 'jsReplace']));



//Gulp Karma for tests

/*gulp.task('runTests', function (done) {
    karma.start({
        configFile: __dirname + '/test/karma.conf.js',
        singleRun: true
    }, done);

});*/

/*gulp.task('test', function(done) {
    karma.start({
        configFile:'./test/karma.conf.js',
        singleRun: true
    }, function() {
        done();
    });
});*/

var testFiles = [
      './app/test/LoginControllerTest.js',
      './app/test/SampleViewControllerTest.js'
];
 
gulp.task('test', function() {
  // Be sure to return the stream 
  return gulp.src(testFiles)
    .pipe(karma({
      configFile: 'test/karma.conf.js',
      action: 'run'
    }));
   /* .on('error', function(err) {
      // Make sure failed tests cause gulp to exit non-zero 
      throw err;
    });*/
});
 
/*gulp.task('default', function() {
  gulp.src(testFiles)
    .pipe(karma({
      configFile: 'test/karma.conf.js',
      action: 'watch'
    }));
});*/



/**
 * Watch files and serve
 * @return {Stream}
 */
gulp.task('serve', function () {
    var files = (pkg.paths.serve);
    browserSync.init(files, {
        server: {
            baseDir: './app'
        },
        port: 8080
    });
});