var gulp = require('gulp');
var install = require('gulp-install');
var minifyCss = require('gulp-minify-css');
var usemin = require('gulp-usemin');
var minifyHtml = require('gulp-minify-html');
var ngmin = require('gulp-ngmin');
var uglify = require('gulp-uglify');
var rev = require('gulp-rev');
var del = require('del');
var sass = require('gulp-sass');
var ngAnnotate = require('gulp-ng-annotate');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('install', function () {
  return gulp.src(['./package.json', './www/bower.json'])
    .pipe(install());
});

gulp.task('concat-production', function () {
  return gulp.src('./app/src/index.html')
    .pipe(usemin({
      css: [minifyCss(), 'concat', rev()],
      html: [minifyHtml({empty: true})],
      lib: [uglify(), rev()],
      angular: [ngAnnotate(), uglify(), rev()],
      app: [ngAnnotate(), uglify(), rev()]
    }))
    .pipe(gulp.dest('./app/www/'))
});

gulp.task('concat-quick', function () {
  return gulp.src('./app/src/index.html')
    .pipe(usemin({
      css: [rev()],
      html: [],
      lib: [sourcemaps.init(),rev(),sourcemaps.write('.')],
      angular: [sourcemaps.init(),rev(),sourcemaps.write('.')],
      app: [sourcemaps.init(),rev(),sourcemaps.write('.')]
    }))
    .pipe(gulp.dest('./app/www/'))
});

gulp.task('copy-assets', ['copy-fonts'], function () {
  gulp.src(['./app/src/partial/**/*', './app/src/directive/**/*', './app/src/img/**/*'], {base: "./app/src"})
    .pipe(gulp.dest('./app/www/'))
});

gulp.task('copy-fonts', function () {
  gulp.src(['./app/src/bower_components/font-awesome/fonts/**/*'])
    .pipe(gulp.dest('./app/www/fonts/'))
});

gulp.task('clean', function (cb) {
  del.sync('./app/www/**/*', cb);
});

gulp.task('sass', function () {
  gulp.src('./app/src/scss/puntaa.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./app/src/css'));
});

gulp.task('buildQuick', ['clean', 'copy-assets', 'concat-quick']);
gulp.task('build', ['clean', 'copy-assets', 'concat-production']);