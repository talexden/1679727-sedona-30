const {src, dest, watch, series, parallel} = require('gulp');
const htmlValidator = require('gulp-w3c-html-validator');
const htmlhint = require('gulp-htmlhint');
const lintspaces = require('gulp-lintspaces');
const stylelint = require('gulp-stylelint');
const twig = require('gulp-twig');
const data = require('gulp-data');
const svgstore = require('gulp-svgstore');
const htmlBeautify = require('gulp-html-beautify');
const less = require('gulp-less');
const postcss = require('gulp-postcss');
const imagemin = require('gulp-imagemin');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const rename = require('gulp-rename');
const gulpIf = require('gulp-if');
const browserSync = require('browser-sync').create();
const del = require('del');

const {OFFLINE} = process.env;
const SVGO_PLUGINS_CONFIG = {
  floatPrecision: 2
};
const SVGO_CONFIG = {
  plugins: [
    { removeViewBox: false },
    { removeTitle: true },
    { cleanupNumericValues: SVGO_PLUGINS_CONFIG },
    { convertPathData: SVGO_PLUGINS_CONFIG },
    { transformsWithOnePath: SVGO_PLUGINS_CONFIG },
    { convertTransform: SVGO_PLUGINS_CONFIG },
    { cleanupListOfValues: SVGO_PLUGINS_CONFIG }
  ]
};

const htmlTest = () => src('*.html')
  .pipe(lintspaces({
    editorconfig: '.editorconfig'
  }))
  .pipe(lintspaces.reporter())
  .pipe(htmlhint('.htmlhintrc'))
  .pipe(htmlhint.reporter())
  .pipe(gulpIf(!OFFLINE, htmlValidator()))
  .pipe(gulpIf(!OFFLINE, htmlValidator.reporter()));

const htmlBuild = () => src('src/twig/pages/**/*.twig')
  .pipe(data(async (file) => {
    const page = file.path.replace(/\\/g, '/').replace(/^.*?twig\/pages\/(.*)\.twig$/, '$1');
    await del(`${page}.html`);
    return {
      page
    };
  }))
  .pipe(twig())
  .pipe(htmlBeautify())
  .pipe(dest('.'));

const cssTest = () => src('src/less/**/*.less')
  .pipe(lintspaces({
    editorconfig: '.editorconfig'
  }))
  .pipe(lintspaces.reporter())
  .pipe(stylelint({
    reporters: [
      {
        console: true,
        formatter: 'string'
      }
    ]
  }));

const cssBuild = () => src('src/less/style.less')
  .pipe(less())
  .pipe(postcss([
    autoprefixer()
  ]))
  .pipe(dest('css'))
  .pipe(postcss([
    cssnano()
  ]))
  .pipe(rename({
    suffix: '.min'
  }))
  .pipe(dest('css'));

// Сборка спрайта
const spriteBuild = () => src('src/sprite/**/*.svg')
  .pipe(imagemin([imagemin.svgo(SVGO_CONFIG)]))
  .pipe(svgstore({
    inlineSvg: true
  }))
  .pipe(dest('img'));

const reload = (done) => {
  browserSync.reload();
  done();
};

const watchTask = () => {
  browserSync.init({
    cors: true,
    notify: false,
    server: '.',
    ui: false
  });

  watch('src/twig/**/*.twig', series(htmlBuild, htmlTest, reload));
  watch('src/less/**/*.less', series(cssTest, cssBuild, reload));
  watch('src/sprite/**/*.svg', series(cssTest, spriteBuild, htmlBuild, reload));
};

const test = parallel(htmlTest, cssTest);
const build = series(spriteBuild, parallel(htmlBuild, cssBuild));

exports.test = test;
exports.build = build;
exports.default = series(test, build, watchTask);
