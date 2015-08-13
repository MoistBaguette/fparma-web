var gulp = require('gulp')
var nodemon = require('gulp-nodemon')
var rem = require('rimraf')
var sourcemaps = require('gulp-sourcemaps')
var uglify = require('gulp-uglify')
var browserSync = require('browser-sync')
var buildSemantic = require('./client/semantic/tasks/build')
var watchSemantic = require('./client/semantic/tasks/watch')

var BROWSER_SYNC_RELOAD_DELAY = 500

gulp.task('build', ['scripts', 'css'])
gulp.task('watch-semantic', watchSemantic)

gulp.task('dev', ['build'], function () {
  buildSemantic()
  gulp.watch(['client/js/**/*.js'], ['scripts'])
  gulp.watch(['client/css/**/*.css'], ['css'])
  gulp.watch(['public/js/**/*.js', 'server/views/**/*'], browserSync.reload)
  gulp.start('watch-semantic')
  gulp.start('browsersync')
})

gulp.task('scripts', function () {
  rem('public/js/**/*', function () {
    gulp.src(['client/js/**/*.js'])
      .pipe(sourcemaps.init())
      .pipe(uglify())
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('public/js'))
  })
})

gulp.task('css', function () {
  rem('public/css/**/*', function () {
    gulp.src(['client/css/**/*.css'])
      .pipe(gulp.dest('public/css'))
      .pipe(browserSync.stream())
  })
})

// browsersync - watches client files and reloads browser
gulp.task('browsersync', ['nodemon'], function () {
  // for more browser-sync config options: http://www.browsersync.io/docs/options/
  browserSync.init({
    proxy: 'http://localhost:8080',
    port: 3000
  })
})

// nodemon - watches server files and restart server on change
gulp.task('nodemon', function (cb) {
  var called = false
  return nodemon({
    script: 'index.js',
    ignore: ['server/views/**/*'],
    // watch core server file(s) that require server restart on change
    watch: ['index.js', 'config.example.json', 'config.json', 'server/**/*']
  })
  .on('start', function onStart () {
    if (!called) { cb() }
    called = true
  })
  .on('restart', function onRestart () {
    setTimeout(function reload () {
      browserSync.reload({
        stream: false
      })
    }, BROWSER_SYNC_RELOAD_DELAY)
  })
})