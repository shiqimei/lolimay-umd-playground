const gulp = require('gulp');
const del = require('del');
const sourcemaps = require('gulp-sourcemaps');
const tsc = require('gulp-typescript');
const tslint = require('gulp-tslint');
const shell = require('gulp-shell');

const tsp = tsc.createProject('tsconfig.json');

// Remove the tests include from the project
const testIndex = tsp.config.include.indexOf('tests');
if (testIndex > -1) {
    tsp.config.include.splice(testIndex, 1);
}

function clean_generated() {
    return del(['./dist']);
}

function lint_ts() {
    return tsp.src().pipe(tslint({ formatter: 'verbose' })).pipe(tslint.report());
}

function compile_ts() {
    return tsp.src().pipe(sourcemaps.init())
            .pipe(tsp())
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest('./dist'));
}

function watch() {
    gulp.watch('src/*.ts', gulp.series(lint_ts, compile_ts));
}

const compile = gulp.series(clean_generated, lint_ts, compile_ts);

gulp.task('clean', clean_generated);

gulp.task('compile', compile);

gulp.task('default', gulp.series(compile, watch));

gulp.task('pack', gulp.series(clean_generated, lint_ts, compile_ts, shell.task([
    'npm pack'
])));

gulp.task('publish', gulp.series(clean_generated, lint_ts, compile_ts, shell.task([
    'npm publish --access public && npm pack'
], [
    'cd definition && npm publish --access public && npm pack'
])));
