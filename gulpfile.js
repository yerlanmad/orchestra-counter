const gulp = require('gulp')
const gulpsync = require('gulp-sync')(gulp)
const livereload = require('gulp-livereload')
const sass = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')
const del = require('del')
const nunjucksRender = require('gulp-nunjucks-render')
const connect = require('gulp-connect-multi')
const devServer = connect();
var proxy = require('http-proxy-middleware');

var isWindows = process.platform === 'win32';
var chromeBrowser = isWindows ? 'Chrome' : 'Google Chrome';

// Configuration
require('events').EventEmitter.prototype._maxListeners = 100;
var targetOrchestra = "10.2.2.210:8080";

// Tasks
gulp.task('clean:build', function () {
  return del([
    './dist'
  ])
})

gulp.task('compile:nunjucks', function() {
  return gulp.src(['./src/templates/index.nunjucks'])
  .pipe(nunjucksRender({
      path: ['./src/templates/']
    }))
  .pipe(gulp.dest('./dist')).pipe(devServer.reload())
});

gulp.task('compile:scss', function () {
  return gulp.src('./src/styles/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulp.dest('./dist/css')).pipe(devServer.reload())
})

gulp.task('move:assets', function () {
  return gulp.src('./src/assets/**')
    .pipe(gulp.dest('./dist/assets'))
})

gulp.task('move:images', function () {
  return gulp.src(['./src/images/**'])
    .pipe(gulp.dest('./dist/images'))
})

gulp.task('move:icons', function () {
  return gulp.src('./src/icons/**')
    .pipe(gulp.dest('./dist/css/icons'))
})

gulp.task('move:js', function () {
  return gulp.src(['src/scripts/**/*.js'])
    .pipe(gulp.dest('./dist/scripts')).pipe(devServer.reload())
})

gulp.task('move:previous_counter_files', function () {
  return gulp.src(['./previous_web_counter/**/*', '!./previous_web_counter/index.html'])
    .pipe(gulp.dest('./dist'))
})

gulp.task('move:previous_counter_js', function() {
  return gulp.src(['./previous_web_counter/scripts/**/*.js', '!./previous_web_counter/scripts/jquery/*.js'])
    .pipe(gulp.dest('./dist/scripts'))
});

gulp.task('watch:start', function () {
  gulp.watch(['./src/styles/**/*.scss'], ['compile:scss'])
  gulp.watch(['src/scripts/**/*.js'], ['move:js'])
  gulp.watch('./src/templates/**/*.nunjucks', ['compile:nunjucks'])
  gulp.watch('./previous_web_counter/scripts/**/*.js', ['move:previous_counter_js'])
})


gulp.task('connect', devServer.server({
    root: ['./dist'],
    port: 1337,
    livereload: true,
    open: {
        browser: chromeBrowser // if not working OS X browser: 'Google Chrome'
    },
    middleware: function (connect, opt) {
        return [
                proxy('/rest', {
                    target: 'http://'+ targetOrchestra +':8080',
                    route: '/rest',
                    changeOrigin:false,
                    ws: true 
                }),
                proxy('/css/orchestra.css', {
                    target: 'http://'+ targetOrchestra +':8080',
                    route: '/css/orchestra.css',
                    changeOrigin:true,
                    ws: true 
                }),
                proxy('/css/reset.css', {
                    target: 'http://'+ targetOrchestra +':8080',
                    route: '/css/reset.css',
                    changeOrigin:true,
                    ws: true 
                }),
                proxy('/css/css3.css', {
                    target: 'http://'+ targetOrchestra +':8080',
                    route: '/css/css3.css',
                    changeOrigin:true,
                    ws: true 
                }),
                proxy('/events/scripts/org/cometd.js', {
                    target: 'http://'+ targetOrchestra +':8080',
                    route: '/events/scripts/org/cometd.js',
                    changeOrigin:true,
                    ws: true 
                }),
                proxy('/events/scripts/jquery/jquery.cometd.js', {
                    target: 'http://'+ targetOrchestra +':8080',
                    route: '/events/scripts/jquery/jquery.cometd.js',
                    changeOrigin:true,
                    ws: true 
                }),
                proxy('/events/qevents_cometd.js', {
                    target: 'http://'+ targetOrchestra +':8080',
                    route: '/events/qevents_cometd.js',
                    changeOrigin:true,
                    ws: true 
                }),
                proxy('/images/icons/home.png', {
                    target: 'http://'+ targetOrchestra +':8080',
                    route: '/images/icons/help.png',
                    changeOrigin:true,
                    ws: true 
                }),
                proxy('/images/icons/help.png', {
                    target: 'http://'+ targetOrchestra +':8080',
                    route: '/images/icons/help.png',
                    changeOrigin:true,
                    ws: true 
                }),
                proxy('/cometd', {
                    target: 'http://'+ targetOrchestra +':8080',
                    route: '/cometd',
                    changeOrigin:false,
                    ws: true 
                }),
                proxy('/workstationterminal/bundle', {
                    target: 'http://'+ targetOrchestra +':8080',
                    route: '/workstationterminal/bundle',
                    changeOrigin:true,
                    ws: true 
                })
            ]
    }
    // middleware: function (connect, opt) {
    //     var Proxy = require('proxy-middleware');
    //     //opt.route = ['/rest/servicepoint/user', '/rest/servicepoint/user'];
    //     //opt.route = '/rest';
    //     var proxyOptions = url.parse('http://192.168.5.79:8080/rest');
    //     proxyOptions.route = ['/rest', '/css'];
    //     var proxy = Proxy(proxyOptions);
    //     return [proxy];
    // }
}));


gulp.task('build', gulpsync.sync(
  [
    'clean:build', 
    'compile:nunjucks',
    'compile:scss', 
    'move:js',
    'move:assets',
    'move:images', 
    'move:icons',
    'move:previous_counter_files'
    ]), function () {
  return console.log(`Build Created in folder ./dist`)
})

gulp.task('build:dev', gulpsync.sync(
  [
    'clean:build', 
    'compile:nunjucks',
    'compile:scss',
    'move:js', 
    'move:assets',
    'move:images', 
    'move:icons',
    'move:previous_counter_files',
    'watch:start',
    'connect'
    ]), function () {
  return console.log(`Build Created in folder ./dist - Listening to changes in scripts/styles/templates...`)
})
