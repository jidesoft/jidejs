var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    header = require('gulp-header'),
    footer = require('gulp-footer'),
    replace = require('gulp-replace'),
    less = require('gulp-less'),
    zip = require('gulp-zip'),
    path = require('path'),
    pkg = require('./package.json');

var preamble = '/*! <%=pkg.name%> <%=pkg.version%> - <%= now %>\n <%= pkg.licenseString %>\n Author: <%=pkg.author%> */\n',
    preambleConfig = {
        pkg: pkg,
        now: (function() {
            var now = new Date();
            return now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDate();
        }())
    };

gulp.task('minify', function() {
    gulp.src('./base/**/*.js')
        .pipe(uglify())
        .pipe(header(preamble, preambleConfig))
        .pipe(gulp.dest('./dist/jidejs/base'));
    return gulp.src('./ui/**/*.js')
        .pipe(uglify())
        .pipe(header(preamble, preambleConfig))
        .pipe(gulp.dest('./dist/jidejs/ui'));
});

gulp.task('less', function() {
    gulp.src('style/default.less')
        .pipe(less({
            paths: [ path.join(__dirname, 'style') ]
        }))
        .pipe(gulp.dest(',/style/default.css'));
    return gulp.src('demo/**/*.less')
        .pipe(less())
        .pipe(gulp.dest('demo'));
});

gulp.task('copy', function() {
    gulp.src(['README.md', 'LICENSE'])
        .pipe(gulp.dest('dist'));
    return gulp.src(['style/**/*.less', 'style/**/*.css'])
        .pipe(gulp.dest('dist/style'));
});

gulp.task('compress', function() {
    return gulp.src('dest/*')
        .pipe(zip('jidejs-'+pkg.version+'.zip'))
        .pipe(gulp.dest('release'));
});

gulp.task('compile:template', function() {
    return gulp.src('ui/control/templates.html')
        .pipe(replace(/\n/g, '\\n'))
        .pipe(replace(/'/g, "\\'"))
        .pipe(header("define(function() { return '"))
        .pipe(footer("'; });"))
        .pipe(gulp.dest('./ui/control/TemplateBundle.js'));
});

gulp.task('jsdoc', function(next) {
    exec('./jsdoc.cmd', next);
});

gulp.task('wintersmith', function(next) {
    exec('./wintersmith.cmd', next);
});

gulp.task('build', ['compile:template', 'less', 'minify', 'copy'], function() {});
gulp.task('release', ['build', 'compress'], function() {});

function exec(cmd, next) {
    var exec = require('child_process').exec;
    var cp = exec(cmd, {stdout: true, stderr: true}, function (err, stdout, stderr) {
        if (err) {
            console.log(err);
        }
        console.log(stdout);
        console.log(stderr);
        next();
    });
}