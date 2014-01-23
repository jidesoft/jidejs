module.exports = function(grunt) {
	var examples = require('./compileExamples')
		, UglifyJS = require("uglify-js2")
        , fs = require('fs');

	// Project configuration.
	var banner = '/*! <%=pkg.name%> <%=pkg.version%> - <%= grunt.template.today("yyyy-mm-dd") %>\n <%= pkg.licenseString %>\n Author: <%=pkg.author%> */\n';
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		minify: {
			base: {
				options: {
					banner: banner,
					pattern: '**/*.js',
					cwd: 'base',
					out: 'dist/jidejs/base/'
				}
			},
            ui: {
                options: {
                    banner: banner,
                    pattern: '**/*.js',
                    cwd: './ui',
                    out: 'dist/jidejs/ui/'
                }
            },
			requirejs: {
				options: {
					banner: "/** vim: et:ts=4:sw=4:sts=4\n" +
						"* @license RequireJS 2.1.6 Copyright (c) 2010-2012, The Dojo Foundation All Rights Reserved.\n" +
						"* Available via the MIT or new BSD license.\n" +
						"* see: http://github.com/jrburke/requirejs for details\n" +
						'*/',
					pattern: 'website/build/bower_components/requirejs/*.js',
					cwd: 'website/build/bower_components/requirejs',
					out: 'website/build/bower_components/requirejs/'
				}
			}
		},

		less: {
			controls: {
				options: {
					paths: ["style"],
					yuicompress: true
				},
				files: {
					"dist/jidejs/default.css": "style/default.less",
                    "style/default.css": "style/default.less"
				}
			},
			demos: {
				files: {
					"demo/apps/email/style.css": "demo/apps/email/style.less",
					"demo/apps/contacts/style.css": "demo/apps/contacts/style.less",
					"demo/apps/issues/style.css": "demo/apps/issues/style.less",
                    "demo/styling/osx/style/jide.css": "demo/styling/osx/style/jide.less"
				}
			},
            website: {
                files: {
                    "website/build/style/docs.css": "website/contents/style/docs.less"
                }
            }
		},

		copy: {
            dist: {
                files: [
                    //{src: ['**/*.html'], dest: 'dist/jidejs/', cwd: 'ui', expand: true},
                    {src: ['README.md', 'LICENSE'], dest: 'dist/'}
                ]
            },
			debug: {
				files: [
					{src: ['bower_components/**'], dest: 'website/build/'},
					// copy demos
					{src: ['demo/**'], dest: 'website/build/'},
					// copy minified jidejs
					{src: ['**/*'], dest: 'website/build/jidejs/ui/', cwd: 'ui', expand: true},
                    {src: ['**/*'], dest: 'website/build/jidejs/base/', cwd: 'base', expand: true}
				]
			},
			website: {
				files: [
					{src: ['bower_components/**'], dest: 'website/build/'},
					// copy demos
					{src: ['demo/**'], dest: 'website/build/'},
					// copy minified jidejs
					{src: ['**/*'], dest: 'website/build/jidejs/', cwd: 'dist/jidejs', expand: true}
//                    {src: ['**/*.html'], dest: 'website/build/jidejs/', cwd: 'jidejs', expand: true}
				]
			},
			themes: {
				files: [
					{src: ['**/*.less'], dest: 'dist/themes/', cwd: 'style', expand: true}
				]
			}
		},

        wintersmith: {
            build: {
                options: {
                    action: 'build',
                    config: './website/config.json'
                }
            }
        },

		compress: {
			zip: {
				options: {
					archive: 'release/jidejs-<%=pkg.version%>.zip'
				},
				files: [
					{src: ['**/*'], dest: '/', cwd: 'dist', expand: true}
				]
			}
		},

        shell: {
            jsdoc: {
                command: 'jsdoc.cmd',
                options: {
                    stdout: true
                }
            }
        }
	});

	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-wintersmith');

	grunt.registerTask('compile:examples', function() {
		var done = this.async();
		examples.compile('docs/examples', 'website/contents/examples/examples.js', done);
	});

    grunt.registerTask('compile:template', function() {
        var template = String(fs.readFileSync('./ui/control/templates.html'));
        var content = template.replace(/\n/g, '\\n');
        content = content.replace(/'/g, "\\'");
        fs.writeFileSync('./ui/control/TemplateBundle.js', "define(function() { return '"+content+"'; });");
    });

	function copyFiles(pattern, cwd, outdir, process) {
		var files = grunt.file.expand(pattern);
		files.forEach(function(file) {
			var outFileName = outdir+file.substr(cwd.length);
			grunt.file.copy(file, outFileName, {
				process: process
			});
		});
	}

	grunt.registerMultiTask('minify', function() {
		// need to make that work from config
		var options = this.options();
		var banner = options.banner || '';
		var uglify = function(content) {
			return banner + UglifyJS.minify(content, {
				fromString: true
			}).code;
		};
		grunt.log.writeflags(options);
		copyFiles(options.pattern, options.cwd, options.out, uglify);
		grunt.log.writeln('Completed copying and minifying sources.');
	});

	// Define command line tasks.

	// build dist (minified source + css/less files)
	grunt.registerTask('build', [
		'compile:template', 'minify:base', 'minify:ui', 'copy:dist', 'less:controls', 'less:demos', 'copy:themes'
	]);

    grunt.registerTask('release', [
        'build', 'compress:zip'
    ]);

	// build the website
	grunt.registerTask('website', [
		'build', 'shell:jsdoc', 'compile:examples', 'wintersmith:build', 'copy:website', 'wintersmith:build', 'minify:requirejs',
        'less:website'
	]);

	grunt.registerTask('website-no-doc', [
		'build', 'compile:examples', 'wintersmith:build', 'copy:website', 'minify:requirejs', 'less:website'
	]);

	grunt.registerTask('website:debug', [
		'build', 'compile:examples', 'wintersmith:build', 'copy:debug', 'less:website'
	]);

	// the default task is to build everything
	grunt.registerTask('default', ['build']);

	// start a web server to preview the website
	grunt.registerTask('website-preview', ['website', 'wintersmith:build', 'less:website'], function() {
		var done = this.async();
		var express = require('express')
			, http = require('http')
			, path = require('path');

		var app = express();
		app.use(express.favicon());
		app.use(express.logger('dev'));
		app.use(express.compress());
		app.use(express.static(__dirname+'/website/build'));
		app.listen(3000).on('close', done);
		console.log('Server started at port '+3000);
	});

	grunt.registerTask('run', [], function() {
		var done = this.async();
		var express = require('express')
			, http = require('http')
			, path = require('path')
			, lessMiddleware = require('less-middleware');

		var app = express();
		app.use(express.favicon());
		app.use(express.logger('dev'));
		app.use(express.compress());
		app.use('/demo', lessMiddleware({
			src: __dirname + '/demo',
			compress: false
		}));
		app.use('/jidejs', lessMiddleware({
			src: __dirname + '/style',
			compress: false
		}));
        app.use('/jidejs/base', express.static(__dirname+'/base'));
		app.use('/jidejs/ui', express.static(__dirname+'/ui'));
		app.use('/jidejs', express.static(__dirname+'/style'));
		app.use('/demo', express.static(__dirname+'/demo'));
        app.use('/bower_components', express.static(__dirname+'/bower_components'));
		app.listen(3000).on('close', done);
		console.log('Server started at port '+3000);
	});
};