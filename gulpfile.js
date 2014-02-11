var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    header = require('gulp-header'),
    footer = require('gulp-footer'),
    replace = require('gulp-replace'),
    less = require('gulp-less'),
    zip = require('gulp-zip'),
    minifyCSS = require('gulp-minify-css'),
    rjs = require('gulp-requirejs'),
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

gulp.task('copy-source', function() {
    gulp.src('./base/**/*.js')
        .pipe(header(preamble, preambleConfig))
        .pipe(gulp.dest('./dist/jidejs/base'));
    return gulp.src('./ui/**/*.js')
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
    gulp.src('bower_components/codemirror/**')
        .pipe(gulp.dest('website/build/bower_components/codemirror'));
    gulp.src('bower_components/jquery/**')
        .pipe(gulp.dest('website/build/bower_components/jquery'));
    gulp.src('bower_components/Faker/**')
        .pipe(gulp.dest('website/build/bower_components/Faker'));
    gulp.src('bower_components/requirejs-text/**')
        .pipe(gulp.dest('website/build/bower_components/requirejs-text'));
    gulp.src('bower_components/requirejs/require.js')
        .pipe(uglify())
        .pipe(gulp.dest('website/build/bower_components/requirejs'));
    gulp.src('demo/**')
        .pipe(gulp.dest('website/build/demo'));
    gulp.src('dist/jidejs/**')
        .pipe(gulp.dest('website/build/bower_components/jidejs'));
    gulp.src('dist/style/default.css')
        .pipe(gulp.dest('website/build/bower_components/jidejs'));
});

gulp.task('optimize:website', function() {
    gulp.src('./website/build/**/*.css')
        .pipe(minifyCSS({}))
        .pipe(gulp.dest('./website/build/'));
    gulp.src('./website/build/**/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('website/build/'));
});

gulp.task('build:core-js', function() {
    rjs({
        baseUrl: './website/build/bower_components/',
        skipDirOptimize: true,

        name: 'jidejs/base/Class',
        include: [
            'jidejs/base/ObservableProperty', 'jidejs/base/Util', 'jidejs/base/Window', 'jidejs/base/DOM',
            'jidejs/base/ObservableList', 'jidejs/base/Binding', 'jidejs/base/DependencyProperty',
            'jidejs/base/Dispatcher', 'jidejs/base/has', 'jidejs/ui/Control', 'jidejs/ui/Template',
            'jidejs/ui/control/Button', 'jidejs/ui/control/Label', 'jidejs/ui/layout/HBox', 'jidejs/ui/layout/VBox',
            'jidejs/ui/control/TextField', 'jidejs/ui/layout/BorderPane', 'jidejs/ui/control/Hyperlink',
            'jidejs/ui/control/PopupButton', 'jidejs/ui/control/ListView', 'jidejs/ui/control/Cell',
            'jidejs/ui/control/HTMLView', 'jidejs/ui/control/SingleSelectionModel',
            'jidejs/ui/control/MultipleSelectionModel', 'jidejs/ui/control/ChoiceBox',
            'jidejs/ui/control/ContextMenu', 'jidejs/ui/control/MenuItem', 'jidejs/ui/control/ToolBar',
            'jidejs/ui/control/Tooltip', 'jidejs/ui/control/Popup', 'jidejs/ui/control/Separator'
        ],

        out: 'jidejs-core.js'
    }).pipe(gulp.dest('./website/build/'));

    rjs({
        baseUrl: './website/build/demo/apps/email/',
        skipDirOptimize: false,
        "packages": [{
            name: 'jidejs',
            location: '../../../bower_components/jidejs'
        }],
        paths: {
            text: '../../../bower_components/requirejs-text/text'
        },

        shim: {
            'Handlebars': {
                exports: 'Handlebars'
            },
            'moment': {
                exports: 'moment'
            }
        },

        name: 'main',
        exclude: [
            'jidejs/base/ObservableProperty', 'jidejs/base/Util', 'jidejs/base/Window', 'jidejs/base/DOM',
            'jidejs/base/ObservableList', 'jidejs/base/Binding', 'jidejs/base/DependencyProperty',
            'jidejs/base/Dispatcher', 'jidejs/base/has', 'jidejs/ui/Control', 'jidejs/ui/Template',
            'jidejs/ui/control/Button', 'jidejs/ui/control/Label', 'jidejs/ui/layout/HBox', 'jidejs/ui/layout/VBox',
            'jidejs/ui/control/TextField', 'jidejs/ui/layout/BorderPane', 'jidejs/ui/control/Hyperlink',
            'jidejs/ui/control/PopupButton', 'jidejs/ui/control/ListView', 'jidejs/ui/control/Cell',
            'jidejs/ui/control/HTMLView', 'jidejs/ui/control/SingleSelectionModel',
            'jidejs/ui/control/MultipleSelectionModel', 'jidejs/ui/control/ChoiceBox',
            'jidejs/ui/control/ContextMenu', 'jidejs/ui/control/MenuItem', 'jidejs/ui/control/ToolBar',
            'jidejs/ui/control/Tooltip', 'jidejs/ui/control/Popup', 'jidejs/ui/control/Separator'
        ],

        out: 'main.js'
    }).pipe(gulp.dest('./website/build/demo/apps/email/'));
});

gulp.task('build', ['compile:template', 'less', 'minify', 'copy'], function() {});
gulp.task('build-unminified', ['compile:template', 'less', 'copy-source', 'copy'], function() {});
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

gulp.task('run-demo', function(next) {
    var express = require('express')
        , http = require('http')
        , path = require('path');

    var app = express();
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use('/jidejs/ui', express.static(__dirname+'/ui'));
    app.use('/jidejs/base', express.static(__dirname+'/base'));
    app.use('/jidejs', express.static(__dirname+'/style'));
    app.use('/demo', express.static(__dirname+'/demo'));
    app.use('/bower_components', express.static(__dirname+'/bower_components'));
    app.use('/bower_components/jidejs/ui', express.static(__dirname+'/ui'));
    app.use('/bower_components/jidejs/base', express.static(__dirname+'/base'));
    app.use('/bower_components/jidejs', express.static(__dirname+'/style'));
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