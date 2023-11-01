const gulp = require('gulp');
const copyPlugin = require('gulp-copy');

// Paths
const sourcePath = '../Knowit.Umbraco.InstantBlockPreview/App_Plugins/**/*';
const destinationPath = '../Umbraco12/App_Plugins/';

// Copy task
function copy() {
    return gulp.src(sourcePath)
        .pipe(copyPlugin(destinationPath, { prefix: 3 }))
        .on('error', function(err) {
            console.error('Error!', err.message);
        })
        .pipe(gulp.dest(destinationPath));
}

// Watch task
function watch() {
    gulp.watch(sourcePath, copy);
}

// Define public tasks
gulp.task('copy', copy);
gulp.task('watch', watch);

// Default task
gulp.task('default', gulp.series('copy', 'watch'));
