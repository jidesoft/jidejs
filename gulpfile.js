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
        .pipe(gulp.dest('./style'));
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
    return gulp.src('dist/*')
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
    exec('jsdoc.cmd', next);
});

gulp.task('wintersmith', function(next) {
    var wintersmith = require('wintersmith');
    var env = wintersmith({
        "locals": {
            "title": "jide.js Developer Guide"
        },

        contents: './website/contents',
        templates: './website/templates',
        output: './website/build',

        "plugins": [
            "wintersmith-less",
            "wintersmith-nunjucks",
            "./website/plugins/toc.js",
            "./website/plugins/apilink.js",
            "./website/plugins/utils.js"
        ]
    });
    env.build(next);
});

gulp.task('copy:website', function() {
    gulp.src('bower_components/**')
        .pipe(gulp.dest('website/build/bower_components'));
    gulp.src('demo/**')
        .pipe(gulp.dest('website/build/demo'));
    gulp.src('dist/jidejs/**')
        .pipe(gulp.dest('website/build/bower_components/jidejs'));
    gulp.src('dist/style/default.css')
        .pipe(gulp.dest('website/build/bower_components/jidejs'));
});

gulp.task('build', ['compile:template', 'less', 'minify', 'copy'], function() {});
gulp.task('release', ['build', 'compress'], function() {});

gulp.task('website-preview', function(next) {
    var express = require('express')
        , http = require('http')
        , path = require('path');

    var app = express();
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.compress());
    app.use(express.static(__dirname+'/website/build'));
    app.listen(3000).on('close', next);
    console.log('Server started at port '+3000);
});

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