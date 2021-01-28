const {src, watch, series, parallel} = require('gulp');
const htmlValidator = require('gulp-w3c-html-validator');
const htmlhint = require('gulp-htmlhint');
const lintspaces = require('gulp-lintspaces');
const stylelint = require('gulp-stylelint');
const browserSync = require('browser-sync').create();

const htmlTest = () => src('*.html')
	.pipe(lintspaces({
    editorconfig: '.editorconfig'
  }))
  .pipe(lintspaces.reporter())
	.pipe(htmlhint('.htmlhintrc'))
	.pipe(htmlhint.reporter())
	.pipe(htmlValidator())
	.pipe(htmlValidator.reporter());

const cssTest = () => src('css/**/*.css')
	.pipe(lintspaces({
    editorconfig: '.editorconfig'
  }))
  .pipe(lintspaces.reporter())
	.pipe(stylelint());

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
	watch('css/**/*.css', series(cssTest, reload));
};

const test = parallel(htmlTest, cssTest);

exports.test = test;
exports.default = series(test, watchTask);
