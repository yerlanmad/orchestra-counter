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
const zip = require('gulp-zip');
var sftp = require('gulp-sftp');
var cachebust = require('gulp-cache-bust');

var useref = require('gulp-useref');
var gulpif = require('gulp-if');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-clean-css');
var lineEndCorrector = require('gulp-line-ending-corrector');
var htmlmin = require('gulp-htmlmin');


var isWindows = process.platform === 'win32';
var chromeBrowser = isWindows ? 'Chrome' : 'Google Chrome';

// Remote Deployment Defaults
var remoteDeploymentDefaultPath = "C:\\qmatic\\orchestra\\system\\custdeploy"
var remoteDeploymentDefaultLangPath = "C:\\qmatic\\orchestra\\system\\conf\\lang"
var remoteDeploymentDefaultHost = "localhost"
var remoteDeploymentPlatform = "windows"

// Configuration
// =============

require('events').EventEmitter.prototype._maxListeners = 100;

try {
    var config = require('./config.gulp.json');

    var targetOrchestraIp = config.proxy.host ? config.proxy.host : "localhost";
    var targetOrchestraPort = config.proxy.port ? config.proxy.port : "8080";
    var targetOrchestraProtocol = config.proxy.protocol ? config.proxy.protocol : "http";
    var targetOrchestraUrl = targetOrchestraProtocol + '://' + targetOrchestraIp + ':' + targetOrchestraPort;

    // Must be provided via config.gulp.json file
    var remoteDeployHost = config.remote_deploy.host ? config.remote_deploy.host : remoteDeploymentDefaultHost;
    var remoteDeployUsername = config.remote_deploy.username
    var remoteDeployPassword = config.remote_deploy.password

    console.log("Default Configuration Imported. Remote Orchestra is " + targetOrchestraUrl)
} catch (ex) {

    // For those who don't provide an external configuration, use the following default. 
    // Assuming Orchestra is running on local machine
    var targetOrchestraUrl = "http://localhost:8080";
    console.log("You are using default gulp configuration. Remote Orchestra is " + targetOrchestraUrl)
}

// Tasks
// =====

gulp.task('clean:build', function () {
    return del([
        './dist'
    ])
})

gulp.task('clean:war', function () {
    return del([
        './dist/**/*', '!./dist/workstationterminal.war'
    ])
})

gulp.task('compile:nunjucks', function () {
    return gulp.src(['./src/templates/index.nunjucks'])
        .pipe(nunjucksRender({
            path: ['./src/templates/']
        }))
        .pipe(gulp.dest('./dist')).pipe(devServer.reload())
});

gulp.task('index:concat:uglify', function () {
    return gulp.src(['./dist/index.html'])
        .pipe(lineEndCorrector({ verbose: true, eolc: 'LF', encoding: 'utf8' }))
        .pipe(useref())
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', minifyCss()))
        .pipe(gulp.dest('./dist'))
});

gulp.task('index:minify', function () {
    return gulp.src(['./dist/index.html'])
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest('./dist'))
});

gulp.task('clean:dist', function () {
    return del([
        './dist/css/**/*',
        '!./dist/css/bundle.css',
        './dist/scripts/**/*',
        '!./dist/scripts/bundle.js',
        '!./dist/scripts/json2.js',
        '!./dist/scripts/rest-ie.js',
        '!./dist/scripts/upgrades',
        '!./dist/scripts/upgrades/**/*'
    ])
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

gulp.task('move:inf', function () {
    return gulp.src([
        'src/INF/**/*',
        'src/ping.html'
        ])
        .pipe(gulp.dest('./dist'))
})

gulp.task('move:lang', function () {
    return gulp.src(['./src/lang/*'])
        .pipe(gulp.dest('./dist'))
})

gulp.task('move:config', function () {
    return gulp.src(['./config.properties'])
        .pipe(gulp.dest('./dist'))
})

gulp.task('util:war', function () {
    return gulp.src(['dist/**', '!dist/lang'])
        .pipe(zip('workstationterminal.war'))
        .pipe(gulp.dest('dist/'))
});

gulp.task('watch:start', function () {
    gulp.watch(['./src/styles/**/*.scss'], ['compile:scss'])
    gulp.watch(['src/scripts/**/*.js'], ['move:js'])
    gulp.watch('./src/templates/**/*.nunjucks', ['compile:nunjucks'])
})

gulp.task('cache:killer', function () {
    return gulp.src('dist/index.html')
        .pipe(cachebust({
            type: 'timestamp'
        }))
        .pipe(gulp.dest('dist'));
});

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
                target: targetOrchestraUrl,
                route: '/rest',
                changeOrigin: false,
                ws: true
            }),
            proxy('/css/orchestra.css', {
                target: targetOrchestraUrl,
                route: '/css/orchestra.css',
                changeOrigin: true,
                ws: true
            }),
            proxy('/css/reset.css', {
                target: targetOrchestraUrl,
                route: '/css/reset.css',
                changeOrigin: true,
                ws: true
            }),
            proxy('/css/css3.css', {
                target: targetOrchestraUrl,
                route: '/css/css3.css',
                changeOrigin: true,
                ws: true
            }),
            proxy('/events/scripts/org/cometd.js', {
                target: targetOrchestraUrl,
                route: '/events/scripts/org/cometd.js',
                changeOrigin: true,
                ws: true
            }),
            proxy('/events/scripts/jquery/jquery.cometd.js', {
                target: targetOrchestraUrl,
                route: '/events/scripts/jquery/jquery.cometd.js',
                changeOrigin: true,
                ws: true
            }),
            proxy('/events/qevents_cometd.js', {
                target: targetOrchestraUrl,
                route: '/events/qevents_cometd.js',
                changeOrigin: true,
                ws: true
            }),
            proxy('/images/icons/home.png', {
                target: targetOrchestraUrl,
                route: '/images/icons/help.png',
                changeOrigin: true,
                ws: true
            }),
            proxy('/images/icons/help.png', {
                target: targetOrchestraUrl,
                route: '/images/icons/help.png',
                changeOrigin: true,
                ws: true
            }),
            proxy('/cometd', {
                target: targetOrchestraUrl,
                route: '/cometd',
                changeOrigin: false,
                ws: true
            }),
            proxy('/workstationterminal/bundle', {
                target: targetOrchestraUrl,
                route: '/workstationterminal/bundle',
                changeOrigin: true,
                ws: true
            })
        ]
    }
}));


gulp.task('deploy:war', function () {
    return gulp.src('./dist/workstationterminal.war')
        .pipe(sftp({
            remotePath: remoteDeploymentDefaultPath,
            remotePlatform: remoteDeploymentPlatform,
            host: remoteDeployHost,
            user: remoteDeployUsername,
            pass: remoteDeployPassword
        }));
});

gulp.task('deploy:lang', function () {
    return gulp.src('./dist/workstationTerminalMessages.properties')
        .pipe(sftp({
            remotePath: remoteDeploymentDefaultLangPath,
            remotePlatform: remoteDeploymentPlatform,
            host: remoteDeployHost,
            user: remoteDeployUsername,
            pass: remoteDeployPassword
        }));
});

/**
 * Create customization build, for customization.
 */
gulp.task('build:custom', gulpsync.sync(
    [
        'clean:build',
        'compile:nunjucks',
        'compile:scss',
        'move:js',
        'move:assets',
        'move:images',
        'move:icons',
        'cache:killer',
        'move:inf'
    ]), function () {
        return console.log(`Build Created in folder ./dist`)
    })


/**
 * Create development build in dist and start watching files for changes
 */
gulp.task('build:dev', gulpsync.sync(
    [
        'clean:build',
        'compile:nunjucks',
        'compile:scss',
        'move:js',
        'move:assets',
        'move:images',
        'move:icons',
        'cache:killer',
        'watch:start',
        'connect'
    ]), function () {
        return console.log(`Build Created in folder ./dist - Listening to changes in scripts/styles/templates...`)
    })

/**
 * Create developement war
 */
gulp.task('build:dev:war', gulpsync.sync(
    [
        'clean:build',
        'compile:nunjucks',
        'compile:scss',
        'move:js',
        'move:assets',
        'move:images',
        'move:icons',
        'cache:killer',
        'move:config',
        'util:war',
        'clean:war',
        'move:lang'
    ]), function () {
        return console.log(`workstationterminal.war(Development Build) file created in dist folder`)
    })


/**
* Create Production war
*/
gulp.task('build:prod:war', gulpsync.sync(
    [
        'clean:build',
        'compile:scss',
        'move:js',
        'compile:nunjucks',
        'index:concat:uglify',
        'index:minify',
        'clean:dist',
        'move:assets',
        'move:images',
        'move:icons',
        'cache:killer',
        'move:inf',
        'move:config',
        'util:war',
        'clean:war',
        'move:lang'
    ]), function () {
        return console.log(`workstationterminal.war(Productiion Build) file created in dist folder`)
    })

/**
 *  Deploy war and lang file to a remote Orchestra System
 *  Note - For this to work you need to have openssh installed on the remote server.
 */
gulp.task('deploy:remote', gulpsync.sync(
    [
        'clean:build',
        'compile:scss',
        'move:js',
        'compile:nunjucks',
        'index:concat:uglify',
        'index:minify',
        'clean:dist',
        'move:assets',
        'move:images',
        'move:icons',
        'cache:killer',
        'move:inf',
        'move:config',
        'util:war',
        'clean:war',
        'move:lang',
        'deploy:war',
        'deploy:lang'
    ]), function () {
        return console.log(`workstationterminal.war file created in dist folder`)
    })
