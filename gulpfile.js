let gulp = require('gulp');
let print = require('gulp-print');
let babel = require('gulp-babel');

gulp.task('default', ['transpile-js']);

// transpile es6
gulp.task('transpile-js', () => {
    return gulp.src([
            'scripts/tictactoe.js',
            'scripts/game.js'
        ])
        .pipe(print())
        .pipe(babel({ presets: ['es2015'] }))
        .pipe(gulp.dest('scripts/build'));
});

// listen on file change
gulp.task('watch', () => {
    gulp
        .watch('scripts/*.js', ['transpile-js']);
});