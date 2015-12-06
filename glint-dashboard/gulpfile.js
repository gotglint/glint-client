var gulp = require('gulp');

// plugins
var connect = require('gulp-connect');
var eslint = require('gulp-eslint');
var htmlreplace = require('gulp-html-replace');
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var zip = require('gulp-zip');

// browsersync
var browserSync = require('browser-sync');

// node modules
var del = require('del');
var runSequence = require('run-sequence');
var url = require('url');

// classes to instantiate
var Builder = require('systemjs-builder');

var paths = {
  html: 'src/**/*.+(html|js)',
  scripts: 'src/**/*.es6',
  configjs: 'config.js',
  images: 'src/img/**/*',
  scss: {
    app: 'src/scss/app.scss',
    all: 'src/scss/*.scss'
  },
  dist: 'dist/**/*',
  distjs: 'dist/js/**'
};

gulp.task('clean', function () {
  return del([paths.dist]);
});

gulp.task('sass', function () {
  return gulp.src(paths.scss.app)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass({
      includePaths: require('node-bourbon').includePaths
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/css'));
});

gulp.task('html:dev', function () {
  return gulp.src(paths.html)
    .pipe(plumber())
    .pipe(gulp.dest('dist'));
});

gulp.task('html:dist', function () {
  return gulp.src(paths.html)
    .pipe(htmlreplace({
      'js': 'js/main.js'
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('images', function () {
  gulp.src(paths.images)
    .pipe(gulp.dest('dist/img'));

  gulp.src('src/favicon.ico')
    .pipe(gulp.dest('dist'));
});

gulp.task('lint', function () {
  return gulp.src([paths.scripts, paths.configjs])
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

gulp.task('scripts', ['lint'], function () {
  return gulp.src([paths.scripts, paths.configjs])
    .pipe(gulp.dest('dist'));
});

gulp.task('build', ['sass', 'html:dev', 'scripts', 'images']);

gulp.task('serve', ['watch'], function () {
  var bs = browserSync({logSnippet: false});

  connect.server({
    root: 'dist',
    port: 3000,
    livereload: false,
    middleware: function (connect, opt) {
      return [
        require('connect-browser-sync')(bs)
      ];
    }
  });

  gulp.watch(paths.dist).on('change', browserSync.reload);
});

gulp.task('watch', ['build'], function () {
  gulp.watch(paths.scss.all, ['sass']);
  gulp.watch(paths.html, ['html:dev']);
  gulp.watch(paths.scripts, ['scripts']);
});

gulp.task('clean-js', function () {
  return del([paths.distjs]);
});

gulp.task('bundle-gen', function () {
  var builder = new Builder('', './config.js');

  return builder
    .buildStatic('./src/js/main.js', './dist/js/main.js', {
      runtime: true,
      minify: false,
      mangle: false,
      sourceMaps: false,
      lowResSourceMaps: false
    })
    .then(function () {
      console.log('Build complete');
    })
    .catch(function (err) {
      console.log('Build error');
      console.log(err);
      throw err;
    });
});

gulp.task('bundle', function (callback) {
  runSequence('build', 'clean-js', 'bundle-gen', callback);
});

gulp.task('zip', function () {
  return gulp.src('dist/**')
    .pipe(zip('influent-demo-web.zip'))
    .pipe(gulp.dest('dist'));
});

gulp.task('dist', function (callback) {
  runSequence('clean', 'build', 'html:dist', 'bundle', 'zip', callback);
});

gulp.task('default', ['build']);
