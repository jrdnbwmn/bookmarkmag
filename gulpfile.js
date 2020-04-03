// Get things set up
// -------------------------------------------------------------------
    // Include Gulp
var gulp                    = require("gulp"),

    // HTML plugins
    fileinclude             = require("gulp-file-include"),
    htmlmin                 = require("gulp-htmlmin"),

    // CSS plugins
    sass                    = require("gulp-sass"),
    autoprefixer            = require("gulp-autoprefixer"),
    cssmin                  = require("gulp-clean-css"),
    rename                  = require("gulp-rename"),

    // JS plugins
    concat                  = require("gulp-concat"),
    uglify                  = require("gulp-uglify"),

    // Image plugin
    imagemin                = require("gulp-imagemin"),

    // General plugins
    gutil                   = require("gulp-util"),
    plumber                 = require("gulp-plumber"),
    size                    = require("gulp-size"),
    watch                   = require("gulp-watch"),
    browserSync             = require("browser-sync"),
    reload                  = browserSync.reload;

// Tasks
// -------------------------------------------------------------------
// Start server
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "dist"
        }
    });
});

// Notify on error with a beep
var onError = function(error) {
    console.log(gutil.colors.red(error.message));
    // https://github.com/floatdrop/gulp-plumber/issues/17
    this.emit("end");
    gutil.beep();
};

// HTML task
gulp.task("html", function() {
    return gulp.src("src/html/*.html")
        // Prevent gulp.watch from crashing
        .pipe(plumber(onError))
        // Set up HTML templating
        .pipe(fileinclude({
            prefix: "@@",
            basepath: "src/html"
        }))
        // Clean up HTML a little
        .pipe(htmlmin({
            removeCommentsFromCDATA: true,
            removeRedundantAttributes: true,
            removeEmptyAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            caseSensitive: true,
            minifyCSS: true
        }))
        // Where to store the finalized HTML
        .pipe(gulp.dest("dist"));
});

// create a task that ensures the `js` task is complete before reloading
gulp.task('html-watch', ['html'], function (done) {
    browserSync.reload();
    done();
});

// CSS task
gulp.task("css", function() {
    return gulp.src("src/scss/main.scss")
        // Prevent gulp.watch from crashing
        .pipe(plumber(onError))
        // Compile Sass
        .pipe(sass({ style: "compressed", noCache: true }))
        // parse CSS and add vendor-prefixed CSS properties
        .pipe(autoprefixer({
            browsers: ["last 2 versions"]
        }))
        // Minify CSS
        .pipe(cssmin())
        // Rename the file
        .pipe(rename("production.css"))
        // Show sizes of minified CSS files
        .pipe(size({ showFiles: true }))
        // Where to store the finalized CSS
        .pipe(gulp.dest("dist/css"));
});

// create a task that ensures the `js` task is complete before reloading
gulp.task('css-watch', ['css'], function (done) {
    browserSync.reload();
    done();
});

// JS task
gulp.task("js", function() {
    return gulp.src("src/js/**/*")
        // Prevent gulp.watch from crashing
        .pipe(plumber(onError))
        // Concatenate all JS files into one
        .pipe(concat("production.js"))
        // Minify JS
        .pipe(uglify())
        // Where to store the finalized JS
        .pipe(gulp.dest("dist/js"));
});

// create a task that ensures the `js` task is complete before reloading
gulp.task('js-watch', ['js'], function (done) {
    browserSync.reload();
    done();
});

// Image task
gulp.task("images", function() {
    return gulp.src("src/img/**/*.+(png|jpeg|jpg|gif|svg)")
        // Prevent gulp.watch from crashing
        .pipe(plumber(onError))
        // Minify the images
        .pipe(imagemin())
        // Where to store the finalized images
        .pipe(gulp.dest("dist/img"));
});

// create a task that ensures the `js` task is complete before reloading
gulp.task('images-watch', ['images'], function (done) {
    browserSync.reload();
    done();
});

// use default task to launch Browsersync and watch JS files
gulp.task('default', ['js'], function () {

    // Serve files from the root of this project
    browserSync.init({
        server: {
            baseDir: "dist"
        }
    });

    // add browserSync.reload to the tasks array to make
    // all browsers reload after tasks are complete.
    gulp.watch("src/html/**/*", ['html-watch']);
    gulp.watch("src/scss/**/*", ['css-watch']);
    gulp.watch("src/js/**/*", ['js-watch']);
    gulp.watch("src/img/**/*.+(png|jpeg|jpg|gif|svg)", ['images-watch']);
});
