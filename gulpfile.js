const gulp = require('gulp')

const sass = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')
const del = require('del')

gulp.task('clean:build', function () {
  return del([
    'dist'
  ])
})

gulp.task('compile:js', function () {
  return gulp.src(['src/scripts/**/*.js', '!src/scripts/vendor/**/*.js'])
    .pipe(gulp.dest('./dist/scripts'))
})

gulp.task('compile:scss', function () {
  return gulp.src('./src/styles/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulp.dest('./dist/css'))
})

gulp.task('move:images', function () {
  return gulp.src('./src/images/**')
    .pipe(gulp.dest('./dist/images'))
})

gulp.task('move:icons', function () {
  return gulp.src('./src/icons/**')
    .pipe(gulp.dest('./dist/css/icons'))
})

// gulp.task('move:vendor-css', function () {
//   return gulp.src('./src/styles/vendor/**')
//     .pipe(gulp.dest('./dist/css/vendor'))
// })


gulp.task('move:html', function () {
    return gulp.src('./src/index.html')
    .pipe(gulp.dest('./dist'))
})

gulp.task('move:vendor-js', function () {
  return gulp.src('./src/js/vendor/**')
    .pipe(gulp.dest('./dist/js/vendor'))
})

gulp.task('dev', function () {
  gulp.watch('./src/styles/**/*.scss', ['compile:scss'])
  gulp.watch('./src/scripts/**/*.js', ['compile:js'])
  gulp.watch('./src/index.html', ['move:html'])
})

gulp.task('build', ['compile:js', 'compile:scss', 'move:vendor-js', 'move:images', 'move:icons', 'move:html'], function () {
  return console.log('build completed.')
})


// gulp.task("copy-hbs", function () {
//   var projs = ["app","main"];
//   var hbsGlob = path.join("..", "{" + projs.join(",") + "}","**/*.hbs");

//   return gulp.src(hbsGlob)
//      .pipe(gulp.dest('/usr/local/Cellar/tomcat/7.0.50/libexec/webapps/'))
//      .pipe(notify({message: "task complete", onLast: true}));
// });
