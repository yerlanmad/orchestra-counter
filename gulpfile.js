const gulp = require('gulp');
const gulpsync = require('gulp-sync')(gulp);
const livereload = require('gulp-livereload');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const del = require('del');
const nunjucksRender = require('gulp-nunjucks-render');
const connect = require('gulp-connect');
const devServer = connect;
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
var rename = require('gulp-rename');

var fs = require('fs');
var path = require('path');
var folders = require('gulp-folders');
var ncmd = require('node-cmd');

var isWindows = process.platform === 'win32';
var chromeBrowser = isWindows ? 'Chrome' : 'Google Chrome';
var uttsPath = './utt';

// Remote Deployment Defaults
var remoteDeploymentDefaultPath = 'C:\\qmatic\\orchestra\\system\\custdeploy';
var remoteDeploymentDefaultLangPath =
  'C:\\qmatic\\orchestra\\system\\conf\\lang';
var remoteDeploymentDefaultHost = 'localhost';
var remoteDeploymentPlatform = 'windows';

// Configuration
// =============

require('events').EventEmitter.prototype._maxListeners = 100;

try {
  var config = require('./config.gulp.json');
  
  // Needed for dev server
  var targetOrchestraIp = config.proxy.host ? config.proxy.host : "localhost";
  var targetOrchestraPort = config.proxy.port ? config.proxy.port : "8080";
  var targetOrchestraProtocol = config.proxy.protocol ? config.proxy.protocol : "http";
  var targetOrchestraUrl = targetOrchestraProtocol + '://' + targetOrchestraIp + ':' + targetOrchestraPort;

  // Must be provided via config.gulp.json file
  var remoteDeployHost = config.remote_deploy.host
    ? config.remote_deploy.host
    : remoteDeploymentDefaultHost;
  var remoteDeployUsername = config.remote_deploy.username;
  var remoteDeployPassword = config.remote_deploy.password;

  // Artifactory Deployment (artifactory)
  var targetArtifactoryIp = config.artifactory.host
    ? config.artifactory.host
    : '';
  var targetArtifactoryPath = config.artifactory.path
    ? config.artifactory.path
    : '';
  var targetArtifactoryPort = config.artifactory.port
    ? config.artifactory.port
    : '80';
  var targetArtifactoryProtocol = config.artifactory.protocol
    ? config.artifactory.protocol
    : 'http';
  var targetArtifactoryUsername = config.artifactory.username;
  var targetArtifactoryPassword = config.artifactory.password;
  var targetArtifactoryUrl =
    targetArtifactoryProtocol +
    '://' +
    targetArtifactoryIp +
    ':' +
    targetArtifactoryPort;
} catch (ex) {
  // For those who don't provide an external configuration file, use the following default.
  // Assuming Orchestra is running on local machine
  console.log(ex);
}

// Tasks
// =====

gulp.task('clean:build', function() {
  return del(['./dist']);
});

gulp.task('clean:war', function() {
  return del(['./dist/*', '!./dist/webapp']);
});

gulp.task('compile:nunjucks', function() {
  return gulp
    .src(['./src/templates/index.nunjucks'])
    .pipe(
      nunjucksRender({
        path: ['./src/templates/']
      })
    )
    .pipe(gulp.dest('./dist'))
    .pipe(devServer.reload());
});

gulp.task('index:concat:uglify', function() {
  return gulp
    .src(['./dist/index.html'])
    .pipe(lineEndCorrector({ verbose: true, eolc: 'LF', encoding: 'utf8' }))
    .pipe(useref())
    .pipe(gulpif('*.js', uglify()))
    .pipe(gulpif('*.css', minifyCss()))
    .pipe(gulp.dest('./dist'));
});

gulp.task('index:minify', function() {
  return gulp
    .src(['./dist/index.html'])
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('./dist'));
});

gulp.task('clean:dist', function() {
  return del([
    './dist/css/**/*',
    '!./dist/css/bundle.css',
    './dist/scripts/**/*',
    '!./dist/scripts/bundle.js',
    '!./dist/scripts/json2.js',
    '!./dist/scripts/rest-ie.js',
    '!./dist/scripts/upgrades',
    '!./dist/scripts/upgrades/**/*'
  ]);
});

gulp.task('compile:scss', function() {
  return gulp
    .src('./src/styles/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(
      autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
      })
    )
    .pipe(gulp.dest('./dist/css'))
    .pipe(devServer.reload());
});

gulp.task('move:assets', function() {
  return gulp.src('./src/assets/**').pipe(gulp.dest('./dist/assets'));
});

gulp.task('move:images', function() {
  return gulp.src(['./src/images/**']).pipe(gulp.dest('./dist/images'));
});

gulp.task('move:icons', function() {
  return gulp.src('./src/icons/**').pipe(gulp.dest('./dist/css/icons'));
});

gulp.task('move:js', function() {
  return gulp
    .src(['src/scripts/**/*.js'])
    .pipe(gulp.dest('./dist/scripts'))
    .pipe(devServer.reload());
});

gulp.task('move:inf', function() {
  return gulp.src(['src/INF/**/*', 'src/ping.html']).pipe(gulp.dest('./dist'));
});

gulp.task('move:lang', function() {
  return gulp.src(['./src/lang/*']).pipe(gulp.dest('./dist/properties'));
});

gulp.task('move:config', function() {
  return gulp.src(['./config.properties']).pipe(gulp.dest('./dist'));
});

gulp.task('move:release-notes', function() {
  return gulp.src(['release-notes/**']).pipe(gulp.dest('dist/release-notes/'));
});

gulp.task('build:artifactory:zip', function() {
  try {
    var appData = JSON.parse(fs.readFileSync('./app.json'));
    if (appData) {
      var version = appData.version;
      return gulp
        .src(['dist/**/*'])
        .pipe(zip('counter-' + version + '.zip'))
        .pipe(gulp.dest('dist/'));
    }
  } catch (ex) {
    console.log(
      'There was an exception when trying to read the package.json! - ' + ex
    );
    return false;
  }
});

gulp.task('build:artifactory:clean', function() {
  return del(['./dist/**/*', '!./dist/*.zip']);
});

gulp.task('util:war', function() {
  return gulp
    .src(['dist/**', '!dist/lang'])
    .pipe(zip('workstationterminal.war'))
    .pipe(gulp.dest('dist/webapp/'));
});

gulp.task('watch:start', function() {
  gulp.watch(['./src/styles/**/*.scss'], ['compile:scss']);
  gulp.watch(['src/scripts/**/*.js'], ['move:js']);
  gulp.watch('./src/templates/**/*.nunjucks', ['compile:nunjucks']);
});

gulp.task('cache:killer', function() {
  return gulp
    .src('dist/index.html')
    .pipe(
      cachebust({
        type: 'timestamp'
      })
    )
    .pipe(gulp.dest('dist'));
});

gulp.task('connect', function() {
  devServer.server({
    root: ['./dist'],
    port: 1337,
    livereload: true,
    middleware: function(connect, opt) {
      return [
        proxy('/rest', {
          target: targetOrchestraUrl,
          route: '/rest',
          changeOrigin: false,
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
      ];
    }
  });
});

gulp.task('deploy:war', function() {
  return gulp.src('./dist/webapp/workstationterminal.war').pipe(
    sftp({
      remotePath: remoteDeploymentDefaultPath,
      remotePlatform: remoteDeploymentPlatform,
      host: remoteDeployHost,
      user: remoteDeployUsername,
      pass: remoteDeployPassword
    })
  );
});

gulp.task('deploy:lang', function() {
  return gulp
    .src('./dist/properties/workstationTerminalMessages.properties')
    .pipe(
      sftp({
        remotePath: remoteDeploymentDefaultLangPath,
        remotePlatform: remoteDeploymentPlatform,
        host: remoteDeployHost,
        user: remoteDeployUsername,
        pass: remoteDeployPassword
      })
    );
});

// Task to create utts files from their source files
gulp.task(
  'build:utts',
  folders(uttsPath, function(folder) {
    return gulp
      .src(path.join(uttsPath, folder, '**/*'))
      .pipe(zip(folder + '.utt'))
      .pipe(gulp.dest(path.join(uttsPath, folder)));
  })
);

gulp.task('clean:utts', function() {
  return del([path.join(uttsPath) + '/**/*.utt']);
});

gulp.task('move:utts', function() {
  return gulp
    .src(uttsPath + '/**/*.utt')
    .pipe(rename({ dirname: '' }))
    .pipe(gulp.dest('./dist/utt'));
});

/**
 * Create customization build, for customization.
 */
gulp.task(
  'build:custom',
  gulpsync.sync([
    'clean:build',
    'compile:nunjucks',
    'compile:scss',
    'move:js',
    'move:assets',
    'move:images',
    'move:icons',
    'cache:killer',
    'move:inf',
    'clean:build:utts'
  ]),
  function() {
    return console.log(`Build Created in folder ./dist`);
  }
);

/**
 * Create development build in dist and start watching files for changes
 */
gulp.task(
  'build:dev',
  gulpsync.sync([
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
  ]),
  function() {
    return console.log(
      `Build Created in folder ./dist - Listening to changes in scripts/styles/templates...`
    );
  }
);

/**
 * Create developement war
 */
gulp.task(
  'build:dev:war',
  gulpsync.sync([
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
    'move:lang',
    'clean:build:utts'
  ]),
  function() {
    return console.log(
      `workstationterminal.war(Development Build) file created in dist folder`
    );
  }
);

/**
 * Create developement war
 */
gulp.task('deploy:war:artifactory', function() {
  var warName = fs.readdirSync('./dist')[0];
  var fileExtension = warName.substring(warName.lastIndexOf('.') + 1);
  if (fileExtension === 'zip') {
    ncmd.get(
      `curl -u '${targetArtifactoryUsername}:${targetArtifactoryPassword}' -X PUT ${targetArtifactoryUrl}${targetArtifactoryPath}/${warName} -T ./dist/${warName}`,
      function(err, data, stderr) {
        if (!err) {
          console.log(data);
        } else {
          console.log(err);
        }
      }
    );
  } else {
    console.log('Zip file not found!!');
  }
});

/**
* Create Production war
*/
gulp.task(
  'build:prod:war',
  gulpsync.sync([
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
    'clean:build:utts'
  ]),
  function() {
    return console.log(
      `workstationterminal.war(Productiion Build) file created in dist folder`
    );
  }
);

/**
* Artifactory build
*/
gulp.task(
  'build:artifactory',
  gulpsync.sync([
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
    'clean:build:utts',
    'move:release-notes',
    'build:artifactory:zip',
    'build:artifactory:clean'
  ]),
  function() {
    return console.log(
      `workstationterminal.war(Productiion Build) file created in dist folder`
    );
  }
);

/**
* Clean and rebuilt Utts
*/
gulp.task(
  'clean:build:utts',
  gulpsync.sync(['clean:utts', 'build:utts', 'move:utts', 'clean:utts']),
  function() {
    return console.log(`Utt files created from source`);
  }
);

/**
 *  Deploy war and lang file to a remote Orchestra System
 *  Note - For this to work you need to have openssh installed on the remote server.
 */
gulp.task(
  'deploy:remote',
  gulpsync.sync([
    'build:dev',
    'move:inf',
    'move:config',
    'util:war',
    'clean:war',
    'move:lang',
    'deploy:war',
    'deploy:lang'
  ]),
  function() {
    return console.log(`workstationterminal.war deployed!`);
  }
);

/**
 *  Deploy war and lang file to a remote Orchestra System
 *  Note - For this to work you need to have openssh installed on the remote server.
 */
gulp.task(
  'build:artifactory:deploy',
  gulpsync.sync(['build:artifactory', 'deploy:war:artifactory']),
  function() {
    return console.log(
      `workstationterminal.zip deployed to artifactory server!`
    );
  }
);
