const { src, dest, watch, series, parallel } = require('gulp');
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
const terser = require('gulp-terser');
const browserSync = require('browser-sync').create();
const del = require('del');

const { IS_DEV, IS_OFFLINE } = process.env;
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

const cssSources = ['src/less/style.less'];
const jsSources = ['src/js/script.js'];
if (IS_DEV) {
  cssSources.push('src/less/dev.less');
  jsSources.push('src/js/dev.js');
}

const htmlTest = () => src('src/twig/**/*.twig')
  .pipe(lintspaces({
    editorconfig: '.editorconfig'
  }))
  .pipe(lintspaces.reporter());

const htmlBuild = () => src('src/twig/pages/**/*.twig')
  .pipe(data(async (file) => {
    const page = file.path.replace(/\\/g, '/').replace(/^.*?twig\/pages\/(.*)\.twig$/, '$1');
    return {
      page,
      IS_DEV
    };
  }))
  .pipe(twig())
  .pipe(htmlBeautify())
  .pipe(htmlhint('.htmlhintrc'))
  .pipe(htmlhint.reporter())
  .pipe(gulpIf(!IS_OFFLINE, htmlValidator()))
  .pipe(gulpIf(!IS_OFFLINE, htmlValidator.reporter()))
  .pipe(dest('build'));

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

const cssBuild = () => src(cssSources)
  .pipe(less())
  .pipe(postcss([
    autoprefixer()
  ]))
  .pipe(dest('build/css'))
  .pipe(postcss([
    cssnano()
  ]))
  .pipe(rename({
    suffix: '.min'
  }))
  .pipe(dest('build/css'));

const jsBuild = () => src(jsSources)
  .pipe(terser())
  .pipe(rename({
    suffix: '.min'
  }))
  .pipe(dest('build/js'));

// Сборка спрайта
const spriteBuild = () => src('src/sprite/**/*.svg')
  .pipe(imagemin([imagemin.svgo(SVGO_CONFIG)]))
  .pipe(svgstore({
    inlineSvg: true
  }))
  .pipe(dest('build/img'));

// Копируем статичные данные
const copyFiles = () => src('src/as-is/**/*')
  .pipe(dest('build'));

// Копируем PP-превью
const copyPP = () => src('pixelperfect/**/*')
  .pipe(dest('build/img/pixelperfect'));

// Копируем и минифицируем нормалайз
const copyNormalize = () => src('node_modules/normalize.css/normalize.css')
  .pipe(postcss([
    cssnano()
  ]))
  .pipe(dest('build/css'));

// Очистка билда
const cleanBuild = () => del('build');

const reload = (done) => {
  browserSync.reload();
  done();
};

const watchTask = () => {
  browserSync.init({
    cors: true,
    notify: false,
    server: 'build',
    ui: false
  });

  watch('src/twig/**/*.twig', series(htmlTest, htmlBuild, reload));
  watch('src/less/**/*.less', series(cssTest, cssBuild, reload));
  watch('src/js/**/*.js', series(jsBuild, reload));
  watch('src/sprite/**/*.svg', series(cssTest, spriteBuild, htmlBuild, reload));
  watch('src/as-is/**/*', series(copyFiles, reload));
  watch('pixelperfect/**/*', series(copyPP, reload));
};

const test = parallel(htmlTest, cssTest);
const compile = parallel(htmlBuild, cssBuild, jsBuild, copyFiles, copyNormalize);
const build = series(parallel(test, cleanBuild), spriteBuild, compile);

exports.test = test;
exports.build = build;
exports.default = series(build, copyPP, watchTask);
