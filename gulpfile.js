var gulp = require('gulp');
var install = require('gulp-install');
var minifyCss = require('gulp-minify-css');
var usemin = require('gulp-usemin');
var minifyHtml = require('gulp-minify-html');
var uglify = require('gulp-uglify');
var rev = require('gulp-rev');
var del = require('del');
var sass = require('gulp-sass');
var ngAnnotate = require('gulp-ng-annotate');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('install', function () {
  return gulp.src(['./package.json', './client/src/bower.json'])
    .pipe(install());
});

gulp.task('install:electron', function () {
  return gulp.src('./electron/osx/TorrentBot.app/Contents/Resources/default_app/package.json')
    .pipe(install({production: true}));
})

gulp.task('concat-production', function () {
  return gulp.src('./client/src/index.html')
    .pipe(usemin({
      css: [minifyCss(), 'concat', rev()],
      html: [minifyHtml({empty: true})],
      lib: [uglify(), rev()],
      angular: [ngAnnotate(), uglify(), rev()],
      app: [ngAnnotate(), uglify(), rev()]
    }))
    .pipe(gulp.dest('./client/dist/'));
});

gulp.task('concat-quick', function () {
  return gulp.src('./client/src/index.html')
    .pipe(usemin({
      css: [rev()],
      html: [],
      lib: [rev()],
      angular: [rev()],
      app: [sourcemaps.init(), rev(), sourcemaps.write('.')]
    }))
    .pipe(gulp.dest('./client/dist/'));
});

gulp.task('copy-assets', ['copy-fonts'], function () {
  gulp.src(['./client/src/partial/**/*', './client/src/directive/**/*', './client/src/img/**/*'], {base: "./client/src"})
    .pipe(gulp.dest('./client/dist/'))
});

gulp.task('copy-fonts', function () {
  gulp.src(['./client/src/bower_components/font-awesome/fonts/**/*'])
    .pipe(gulp.dest('./client/dist/fonts/'));
});

gulp.task('clean', function (cb) {
  del.sync('./client/dist/**/*', cb);
});

gulp.task('clean:electron', function (cb) {
  del.sync('./electron/osx/TorrentBot.app/Contents/Resources/default_app', cb);
});

gulp.task('clean-all', ['clean'], function (cb) {
  del.sync(['./client/bower_components/**/*', './node_modules'], cb);
});

gulp.task('sass', function () {
  gulp.src('./client/src/scss/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./client/dist/css'));
});

gulp.task('watch', function () {
  console.log('watching');
  gulp.watch('./client/src/scss/*.scss', ['sass']);
  gulp.watch(['./client/src/**/*.js', './client/src/*.js', './client/src/index.html'], ['concat-quick']);
  gulp.watch(['./client/src/partial/**/*.html', './client/src/directive/**/*.html'], ['copy-assets']);
});

gulp.task('copy:electron', function () {
  return gulp.src(['./app.js', './server.js', './package.json', './main.js', './db.json', './lib/**/*', './client/dist/**/*'], {base: "."})
    .pipe(gulp.dest('./electron/osx/TorrentBot.app/Contents/Resources/default_app'));
});

gulp.task('reinstall', ['clean-all', 'buildQuick']);
gulp.task('buildQuick', ['clean', 'copy-assets', 'concat-quick', 'sass']);
gulp.task('build', ['clean', 'copy-assets', 'concat-production', 'sass']);
gulp.task('build:electron', ['copy:electron', 'install:electron']);
gulp.task('dev', ['buildQuick', 'watch']);