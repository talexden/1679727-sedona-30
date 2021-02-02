const {src, dest, watch, series, parallel} = require('gulp');
const htmlValidator = require('gulp-w3c-html-validator');
const htmlhint = require('gulp-htmlhint');
const lintspaces = require('gulp-lintspaces');
const stylelint = require('gulp-stylelint');
const svgstore = require('gulp-svgstore');
const less = require('gulp-less');
const postcss = require('gulp-postcss');
const imagemin = require('gulp-imagemin');
const autoprefixer = require('autoprefixer');
const browserSync = require('browser-sync').create();

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
	.pipe(htmlValidator())
	.pipe(htmlValidator.reporter());

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
  .pipe(dest(`css`));

// Сборка спрайта
const spriteBuild = () => src('src/sprite/**/*.svg')
  .pipe(imagemin([imagemin.svgo(SVGO_CONFIG)]))
  .pipe(svgstore({
    inlineSvg: true
  }))
  .pipe(dest(`img`));

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

	watch('**/*.html', series(htmlTest, reload));
	watch('src/less/**/*.less', series(cssTest, cssBuild, reload));
	watch('src/sprite/**/*.svg', series(cssTest, spriteBuild, reload));
};

const test = parallel(htmlTest, cssTest);
const build = parallel(cssBuild, spriteBuild);

exports.test = test;
exports.build = build;
exports.default = series(test, build, watchTask);
