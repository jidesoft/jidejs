/*
 * This build script is used to build jide.js and it's website as well as running the demos.
 *
 * Viewing Demos
 * ========================================================================
 *
 * The demos (located in /demo) are served using a node.js webserver.
 * To start the server, run the following command:
 *
 *     gulp serve:demos
 *
 * Now you can view the demos by going to
 *
 *     http://localhost:3000/demo/apps/email/
 *
 * You can view any other demo by modifying the path in the URL.
 * With this setting, you cannot view the website.
 *
 * Viewing the Website
 * ========================================================================
 *
 * Just like when viewing demos, this build script can start a webserver for you that allows you to view
 * the jide.js website (js.jidesoft.com) locally, including the demos.
 *
 * To and run the website, use the following command:
 *
 *     gulp serve:website
 *
 * or
 *
 *     gulp serve:website:plain
 *
 * If you do not wish to run the optimized (minified) version of the website.
 */

//region Imports
var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    header = require('gulp-header'),
    footer = require('gulp-footer'),
    replace = require('gulp-replace'),
    less = require('gulp-less'),
    zip = require('gulp-zip'),
    minifyCSS = require('gulp-minify-css'),
    rjs = require('gulp-requirejs'),
    clean = require('gulp-clean'),
    rename = require('gulp-rename'),
    changed = require('gulp-changed'),
    path = require('path'),
    fs = require('fs'),
    wintersmith = require('wintersmith'),
    pkg = require('./package.json');
//endregion

//region CONFIGURATION
var preamble = '/*! <%=pkg.name%> <%=pkg.version%> - <%= now %>\n <%= pkg.licenseString %>\n Author: <%=pkg.author%> */\n',
    preambleConfig = {
        pkg: pkg,
        now: (function() {
            var now = new Date();
            return now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDate();
        }())
    },
    paths = {
        jidejs: {
            base:'./base/**/*.js',
            ui: './ui/**/*.js',
            plain: ['README.md', 'LICENSE'],
            template: {
                src: 'ui/control/templates.html',
                dest: './ui/control/TemplateBundle.js'
            }
        },
        style: {
             default: 'style/default.less',
             includes: [ path.join(__dirname, 'style') ],
             demos: 'demo/**/*.less',
             dest: './style'
        },
        website: {
            scripts: './website/contents/bower_components'
        }
    },
    jidejsCoreModules = [
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
    wintersmithConfig = {
        "locals": {
            "title": "jide.js Developer Guide"
        },
        port: 3000,

        contents: './website/contents',
        templates: './website/templates',
        output: './website/build',

        "plugins": [
            "wintersmith-livereload",
            "wintersmith-less",
            "wintersmith-nunjucks",
            "./website/plugins/toc.js",
            "./website/plugins/apilink.js",
            "./website/plugins/utils.js"
        ]
    };
//endregion /CONFIGURATION

//region CLEAN
gulp.task('clean:compiled', function() {
    return gulp.src([
            './ui/control/TemplateBundle.js',
            './style/default.css'
        ], {read:false})
        .pipe(clean());
});
gulp.task('clean:build', function() {
    return gulp.src('./dist', {read:false})
        .pipe(clean());
});
gulp.task('clean:website', function() {
    return gulp.src('./website/build', {read:false})
        .pipe(clean());
});
gulp.task('clean:jsdoc', function() {
    return gulp.src('./website/contents/api', {read:false})
        .pipe(clean());
});
gulp.task('clean', ['clean:compiled', 'clean:build', 'clean:api', 'clean:website']);
//endregion /CLEAN

//region COMPILE used resources for jide.js (style, templates)
gulp.task('compile:less:default', function() {
    return gulp.src(paths.style.default)
        .pipe(less({
            paths: paths.style.includes
        }))
        .pipe(gulp.dest(paths.style.dest));
});

gulp.task('compile:template', function() {
    return gulp.src('./ui/control/*.html')
        .pipe(changed('./ui/control', {extension: '.js'}))
        .pipe(replace(/\n/g, '\\n'))
        .pipe(replace(/'/g, "\\'"))
        .pipe(header("define(function() { return '"))
        .pipe(footer("'; });"))
        .pipe(rename({
            extname: '.js'
        }))
        .pipe(gulp.dest('./ui/control'));
});
//endregion /COMPILE

//region BUILD jide.js for distribution
gulp.task('build:copy:base', function() {
    return gulp.src(paths.jidejs.base)
        .pipe(changed('./dist/jidejs/base'))
        .pipe(uglify())
        .pipe(header(preamble, preambleConfig))
        .pipe(gulp.dest('./dist/jidejs/base'));
});
gulp.task('build:copy:ui', ['compile:template'], function() {
    return gulp.src(paths.jidejs.ui)
        .pipe(changed('./dist/jidejs/ui'))
        .pipe(uglify())
        .pipe(header(preamble, preambleConfig))
        .pipe(gulp.dest('./dist/jidejs/ui'));
});
gulp.task('build:copy:plain', function() {
    return gulp.src(['README.md', 'LICENSE'])
        .pipe(changed('dist'))
        .pipe(gulp.dest('dist'));
});
gulp.task('build:copy:style', ['compile:less:default'], function() {
    return gulp.src(['style/**/*.less', 'style/**/*.css'])
        .pipe(changed('dist/style'))
        .pipe(gulp.dest('dist/style'));
});
gulp.task('build', ['build:copy:base', 'build:copy:ui', 'build:copy:plain', 'build:copy:style']);
//endregion /BUILD

//region RELEASE build a release file for jide.js
gulp.task('release:zip', ['build'], function() {
    return gulp.src('dist/*')
        .pipe(zip('jidejs-'+pkg.version+'.zip'))
        .pipe(gulp.dest('release'));
});
//endregion /RELEASE

//region WEBSITE build the js.jidesoft.com website

//region WEBSITE:COPY copy required files to /website/contents directory
gulp.task('website:copy:base', function() {
    var destPath = path.join(paths.website.scripts, 'jidejs', 'base');
    return gulp.src(paths.jidejs.base)
        .pipe(changed(destPath))
        .pipe(header(preamble, preambleConfig))
        .pipe(gulp.dest(destPath));
});
gulp.task('website:copy:ui', ['compile:template'], function() {
    var destPath = path.join(paths.website.scripts, 'jidejs', 'ui');
    return gulp.src(paths.jidejs.ui)
        .pipe(changed(destPath))
        .pipe(header(preamble, preambleConfig))
        .pipe(gulp.dest(destPath));
});
gulp.task('website:copy:deps:codemirror', function() {
    return gulp.src('bower_components/codemirror/**')
        .pipe(changed('website/contents/bower_components/codemirror'))
        .pipe(gulp.dest('website/contents/bower_components/codemirror'));
});
gulp.task('website:copy:deps:jquery', function() {
    return gulp.src('bower_components/jquery/**')
        .pipe(changed('website/contents/bower_components/jquery'))
        .pipe(gulp.dest('website/contents/bower_components/jquery'));
});
gulp.task('website:copy:deps:faker', function() {
    return gulp.src('bower_components/Faker/**')
        .pipe(changed('website/contents/bower_components/Faker'))
        .pipe(gulp.dest('website/contents/bower_components/Faker'));
});
gulp.task('website:copy:deps:requirejs-text', function() {
    return gulp.src('bower_components/requirejs-text/**')
        .pipe(changed('website/contents/bower_components/requirejs-text'))
        .pipe(gulp.dest('website/contents/bower_components/requirejs-text'));
});
gulp.task('website:copy:deps:requirejs', function() {
    return gulp.src('bower_components/requirejs/require.js')
        .pipe(changed('website/contents/bower_components/requirejs'))
        .pipe(gulp.dest('website/contents/bower_components/requirejs'));
});
gulp.task('website:copy:deps', [
    'website:copy:deps:codemirror',
    'website:copy:deps:jquery',
    'website:copy:deps:faker',
    'website:copy:deps:requirejs-text',
    'website:copy:deps:requirejs'
]);
gulp.task('website:copy:demos', function() {
    return gulp.src('demo/**')
        .pipe(changed('website/contents/demo'))
        .pipe(gulp.dest('website/contents/demo'));
});
gulp.task('website:copy:style', ['compile:less:default'], function() {
    gulp.src('./style/default.css')
        .pipe(changed('website/contents/bower_components/jidejs'))
        .pipe(gulp.dest('website/contents/bower_components/jidejs'));
});
gulp.task('website:copy', [
    'website:copy:base',
    'website:copy:ui',
    'website:copy:deps',
    'website:copy:demos',
    'website:copy:style'
]);
//endregion /WEBSITE:COPY

//region WEBSITE:BUILD actually build the website (without optimization)
gulp.task('website:jsdoc', function(next) {
    // most of the time, we only need this because of urlmapping.json file, so do nothing if it already exists
    fs.exists('./website/contents/api/urlmapping.json', function(exists) {
        if(exists) {
            return next();
        } else {
            exec('jsdoc.cmd', next);
        }
    });
});

gulp.task('website:build', ['website:copy', 'website:jsdoc'], function(next) {
    var env = wintersmith(wintersmithConfig);
    env.build(next);
});
//endregion /WEBSITE:BUILD

//region WEBSITE:OPTIMIZE Optimize the website (minify and concatenate sources and so on)
//region WEBSITE:OPTIMIZE:RJS Run r.js optimization
gulp.task('website:optimize:rjs:core', ['website:build'], function() {
    return rjs({
        baseUrl: './website/build/bower_components/',
        skipDirOptimize: true,

        name: 'jidejs/base/Class',
        include: jidejsCoreModules,

        out: 'jidejs-core.js'
    }).pipe(gulp.dest('./website/build/'));
});

gulp.task('website:optimize:rjs:demo:email', ['website:build'], function() {
    return rjs({
        baseUrl: './website/build/demo/apps/email/',
        skipDirOptimize: false,
        "packages": [{
            name: 'jidejs',
            location: '../../../bower_components/jidejs'
        }],
        paths: {
            text: '../../../bower_components/requirejs-text/text',
            Faker: '../../../bower_components/Faker/MinFaker'
        },

        shim: {
            'Handlebars': {
                exports: 'Handlebars'
            },
            'moment': {
                exports: 'moment'
            },
            'Faker': {
                exports: 'Faker'
            }
        },

        name: 'main',
        exclude: jidejsCoreModules,

        out: 'main.js'
    }).pipe(gulp.dest('./website/build/demo/apps/email/'));
});
gulp.task('website:optimize:rjs:demo:contacts', ['website:build'], function() {
    return rjs({
        baseUrl: './website/build/demo/apps/contacts/',
        skipDirOptimize: false,
        "packages": [{
            name: 'jidejs',
            location: '../../../bower_components/jidejs'
        }],
        paths: {
            text: '../../../bower_components/requirejs-text/text',
            Faker: '../../../bower_components/Faker/MinFaker'
        },

        shim: {
            'Faker': {
                exports: 'Faker'
            }
        },

        name: 'main',
        exclude: jidejsCoreModules,

        out: 'main.js'
    }).pipe(gulp.dest('./website/build/demo/apps/contacts/'));
});
gulp.task('website:optimize:rjs', [
    'website:optimize:rjs:core', 'website:optimize:rjs:demo:email', 'website:optimize:rjs:demo:contacts'
]);
//endregion WEBSITE:OPTIMIZE:RJS

//region WEBSITE:OPTIMIZE:MINIFY Minfiy all build files
gulp.task('website:optimize:minify:css', ['website:build'], function() {
    return gulp.src('./website/build/**/*.css')
        .pipe(minifyCSS({}))
        .pipe(gulp.dest('./website/build/'));
});
gulp.task('website:optimize:minify:js', ['website:build', 'website:optimize:rjs'], function() {
    gulp.src('./website/build/**/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('website/build/'));
});
gulp.task('website:optimize:minify', ['website:optimize:minify:css', 'website:optimize:minify:js']);
//endregion WEBSITE:OPTIMIZE:MINIFY

gulp.task('website:optimize', ['website:optimize:minify']);
//endregion /WEBSITE:OPTIMIZE

gulp.task('website', ['website:build', 'website:optimize']);
//endregion /WEBSITE

//region SERVE Starts a server to see the website, demos or whatever
gulp.task('serve:website', ['website'], function(next) {
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

gulp.task('serve:website:plain', ['website:copy', 'website:jsdoc'], function() {
    var env = wintersmith(wintersmithConfig);
    env.preview(function(error, server) {
        if (error) throw error;
        console.log('Server running!');
    });
});

gulp.task('serve:demos', function(next) {
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
gulp.task('serve', ['serve:website']);
//endregion SERVE

//region Utilities
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
//endregion