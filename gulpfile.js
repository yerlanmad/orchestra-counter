const gulp = require('gulp');
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
var folders = require('gulp-folders-4x');
var ncmd = require('node-cmd');

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
  var config = require('./gulp.config.json');

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
  if(targetOrchestraUrl === undefined) {
    var targetOrchestraUrl = "http://localhost:8080";
  }
  console.log('No gulp.config.json found. Assuming orchestra is running on local machine at port 8080');
}

// Tasks
// =====

function cleanBuild(done) {
  del.sync(['./dist']);
  done();
}

gulp.task('clean:build', cleanBuild);

function cleanWar(done) {
  del.sync(['dist/*', '!dist/webapp']);
  done();
}

gulp.task('clean:war', cleanWar);

function compileNunjucks() {
  return gulp
    .src(['./src/templates/index.nunjucks'])
    .pipe(
      nunjucksRender({
        path: ['./src/templates/']
      })
    )
    .pipe(gulp.dest('./dist'))
    .pipe(devServer.reload());
}

gulp.task('compile:nunjucks', compileNunjucks);

function indexConcatUglify() {
  return gulp
    .src(['./dist/index.html'])
    .pipe(lineEndCorrector({ verbose: true, eolc: 'LF', encoding: 'utf8' }))
    .pipe(useref())
    .pipe(gulpif('*.js', uglify()))
    .pipe(gulpif('*.css', minifyCss({compatibility: 'ie11'})))
    .pipe(gulp.dest('./dist'));
  // console.log('before indexconcat done');
  // done();
}

gulp.task('index:concat:uglify', indexConcatUglify);


function indexMinify() {
  return gulp
  .src(['./dist/index.html'])
  .pipe(htmlmin({ collapseWhitespace: true }))
  .pipe(gulp.dest('./dist'));
}

gulp.task('index:minify', indexMinify);

function cleanDist(done) {
  del.sync([
    './dist/css/**/*',
    '!./dist/css/',
    '!./dist/css/bundle.css',
    './dist/scripts/**/*',
    '!./dist/scripts/',
    '!./dist/scripts/bundle.js',
    '!./dist/scripts/json2.js',
    '!./dist/scripts/rest-ie.js',
    '!./dist/scripts/upgrades',
    '!./dist/scripts/upgrades/**/*'
  ]);
  done();
}

gulp.task('clean:dist', cleanDist);

function compileScss() {
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
}

gulp.task('compile:scss', compileScss);

function moveAssets() {
  return gulp.src('./src/assets/**').pipe(gulp.dest('./dist/assets'));
}

gulp.task('move:assets', moveAssets);

function moveImages() {
  return gulp.src(['./src/images/**']).pipe(gulp.dest('./dist/images'));
}

gulp.task('move:images', moveImages);

function moveIcons(done) {
  // return gulp.src('./src/icons/**').pipe(gulp.dest('./dist/css/icons'));
  done();
}

gulp.task('move:icons', moveIcons);

function moveJs() {
  return gulp
    .src(['src/scripts/**/*.js'])
    .pipe(gulp.dest('./dist/scripts'))
    .pipe(devServer.reload());
}

gulp.task('move:js', moveJs);

function moveInf() {
  return gulp.src(['src/INF/**/*', 'src/ping.html']).pipe(gulp.dest('./dist'));
}

gulp.task('move:inf', moveInf);

function moveLang(done) {
  gulp.src(['./src/lang/*']).pipe(gulp.dest('./dist/properties'));
  done();
}

gulp.task('move:lang', moveLang);

function moveConfig() {
  return gulp.src(['./config.properties']).pipe(gulp.dest('./dist'));
}

gulp.task('move:config', moveConfig);

function moveReleaseNotes() {
  return gulp.src(['release-notes/**']).pipe(gulp.dest('dist/release-notes/'));
}

gulp.task('move:release-notes', moveReleaseNotes);

function buildArtifactoryZip(done) {
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
    done(new Error('There was an exception when trying to read the package.json! - ' + ex))
  }
}

gulp.task('build:artifactory:zip', buildArtifactoryZip);

function buildArtifactoryClean(done) {
  del.sync(['dist/*', '!dist/*.zip']);
  done();
}

gulp.task('build:artifactory:clean', buildArtifactoryClean);

function utilWar() {
  return gulp
    .src(['dist/**', '!dist/lang'])
    .pipe(zip('workstationterminal.war'))
    .pipe(gulp.dest('dist/webapp/'));
}

gulp.task('util:war', utilWar);

function watchStart(done) {
  gulp.watch(['./src/styles/**/*.scss'], gulp.parallel('compile:scss'));
  gulp.watch(['src/scripts/**/*.js'], gulp.parallel('move:js'));
  gulp.watch('./src/templates/**/*.nunjucks', gulp.parallel('compile:nunjucks'));
  done();
}

gulp.task('watch:start', watchStart);

function cacheBuster() {
  return gulp
    .src('dist/index.html')
    .pipe(
      cachebust({
        type: 'timestamp'
      })
    )
    .pipe(gulp.dest('dist'));
}

gulp.task('cache:killer', cacheBuster);

function connectDevServer(done) {
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
        proxy('/bundle', {
          target: targetOrchestraUrl,
          route: '/bundle',
          changeOrigin: true,
          ws: true
        })
      ];
    }
  });
  done();
}

gulp.task('connect', connectDevServer);

function deployWar(done) {
  gulp.src('./dist/webapp/workstationterminal.war').pipe(
    sftp({
      remotePath: remoteDeploymentDefaultPath,
      remotePlatform: remoteDeploymentPlatform,
      host: remoteDeployHost,
      user: remoteDeployUsername,
      pass: remoteDeployPassword
    })
  );
  done();
}

gulp.task('deploy:war', deployWar);

function deployLang(done) {
  gulp
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
  done();
}

gulp.task('deploy:lang', deployLang);

// Task to create utts files from their source files

function buildUtts() {
  return
}
gulp.task(
  'build:utts',
  folders(uttsPath, function(folder) {
    const currentUttPath = uttsPath + '/' + folder + '/*';
    return gulp
      .src(currentUttPath)
      .pipe(zip(folder + '.utt'))
      .pipe(gulp.dest(path.join(uttsPath, folder)));
  })
);

function cleanUtts(done) {
  del.sync([path.join(uttsPath) + '/**/*.utt']);
  done();
}

gulp.task('clean:utts', cleanUtts);

function moveUtts() {
  return gulp
    .src(uttsPath + '/**/*.utt')
    .pipe(rename({ dirname: '' }))
    .pipe(gulp.dest('./dist/utt'));
}

gulp.task('move:utts', moveUtts);

/**
* Clean and rebuilt Utts
*/
function cleanBuildUtts(done) {
  console.log(`Utt files created from source`);
  done();
}

gulp.task(
  'clean:build:utts',
  gulp.series('clean:utts', 'build:utts', 'move:utts', 'clean:utts')
);

/**
 * Write to manifest file
 */
function writeManifest(done) {
  try {
    var versionInfo = getVersionInfo();
    if (versionInfo) {
      var fileContent = 'Build-Date: ' + new Date().toISOString().substring(0, 10) + '\r\n';
      fileContent += 'Built-By: gulp' + '\r\n';
      fileContent += 'Product-Name: Orchestra Web Counter' + '\r\n';
      fileContent += 'Build-Version: ' + versionInfo.version + '\r\n';
      fs.writeFileSync('src/INF/META-INF/MANIFEST.MF', fileContent);
      done();
    }
  } catch (ex) {
    console.log(
      'There was an exception when trying to read the package.json! - ' + ex
    );
    done(new Error('There was an exception when trying to read the package.json! - ' + ex));
  }
}

gulp.task('write:manifest', writeManifest);

function getVersionInfo() {
  var appData = JSON.parse(fs.readFileSync('./app.json'));
  if (appData) {
    return {
      //versionPrefix: appData.version,
      //version: appData.version + '.' + appData.build,
      //build: appData.build
      version: appData.version
    };
  }
  return null;
}


/**
 * Create customization build, for customization.
 */
function buildCustom(done) {
  console.log(`Build Created in folder ./dist`);
  done();
}

gulp.task(
  'build:custom',
  gulp.series(
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
  ),
  buildCustom
);




/**
 * Create development build in dist and start watching files for changes
 */

function buildDev(done) {
  console.log(
    `Build Created in folder ./dist - Listening to changes in scripts/styles/templates...`
  );
  done();
}

gulp.task(
  'build:dev',
  gulp.series(
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
  ),
  buildDev
);

/**
 * Create developement war
 */

function buildDevWar(done) {
  console.log(
    `workstationterminal.war(Development Build) file created in dist folder`
  );
  done();
}

gulp.task(
  'build:dev:war',
  gulp.series(
    'clean:build',
    'compile:nunjucks',
    'compile:scss',
    'move:js',
    'move:assets',
    'move:images',
    'move:icons',
    'cache:killer',
    'util:war',
    'clean:war',
    'move:lang',
    'clean:build:utts'
  ),
  buildDevWar
);

/**
 * Create developement war
 */

function deployWarArtifactory(done) {
  var warName = fs.readdirSync('./dist')[0];
  var fileExtension = warName.substring(warName.lastIndexOf('.') + 1);
  if (fileExtension === 'zip') {
    ncmd.get(
      `curl -u '${targetArtifactoryUsername}:${targetArtifactoryPassword}' -X PUT ${targetArtifactoryUrl}${targetArtifactoryPath}/${warName} -T ./dist/${warName}`,
      function(err, data, stderr) {
        if (!err) {
          console.log(data);
          done();
        } else {
          console.log(err);
          done(new Error(err));
        }
      }
    );
  } else {
    console.log('Zip file not found!!');
    done(new Error('Zip file not found!!'));
  }
}

gulp.task('deploy:war:artifactory', deployWarArtifactory);

/**
* Create Production war
*/

function buildProdWar(done) {
  console.log(
    `workstationterminal.war(Productiion Build) file created in dist folder`
  );
  done();
}

gulp.task(
  'build:prod:war',
  gulp.series(
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
    'util:war',
    'clean:war',
    'move:lang',
    'clean:build:utts'
  ),
  buildProdWar
);

/**
* Artifactory build
*/

function buildArtifactory(done) {
  console.log(
    `workstationterminal.war(Productiion Build) file created in dist folder`
  );
  done();
}

gulp.task(
  'build:artifactory',
  gulp.series(
    'clean:build',
    'write:manifest',
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
    'util:war',
    'clean:war',
    'move:lang',
    'clean:build:utts',
    'move:release-notes',
    'build:artifactory:zip',
    'build:artifactory:clean'
  ),
  buildArtifactory
);


/**
 *  Deploy war and lang file to a remote Orchestra System
 *  Note - For this to work you need to have openssh installed on the remote server.
 */
function deployRemote(done) {
  console.log(`workstationterminal.war deployed!`);
  done();
}

gulp.task(
  'deploy:remote',
  gulp.series(
    'build:dev',
    'move:inf',
    'util:war',
    'clean:war',
    'move:lang',
    'deploy:war',
    'deploy:lang'
  ),
  deployRemote
);

/**
 *  Deploy war and lang file to a remote Orchestra System
 *  Note - For this to work you need to have openssh installed on the remote server.
 */

function buildArtifactoryDeploy(done) {
  console.log(
    `workstationterminal.zip deployed to artifactory server!`
  );
  done();
}

gulp.task(
  'build:artifactory:deploy',
  gulp.series('build:artifactory', 'deploy:war:artifactory'),
  buildArtifactoryDeploy
);

