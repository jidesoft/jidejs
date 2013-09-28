module.exports = function(grunt) {
	var examples = require('./compileExamples')
		, UglifyJS = require("uglify-js2");

	// Project configuration.
	var banner = '/*! <%=pkg.name%> <%=pkg.version%> - <%= grunt.template.today("yyyy-mm-dd") %>\n <%= pkg.license %>\n Author: <%=pkg.author%> */\n';
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		minify: {
			source: {
				options: {
					banner: banner,
					pattern: 'jidejs/**/*.js',
					cwd: 'jidejs',
					out: 'dist/jidejs/'
				}
			},
			requirejs: {
				options: {
					banner: "/** vim: et:ts=4:sw=4:sts=4\n" +
						"* @license RequireJS 2.1.6 Copyright (c) 2010-2012, The Dojo Foundation All Rights Reserved.\n" +
						"* Available via the MIT or new BSD license.\n" +
						"* see: http://github.com/jrburke/requirejs for details\n" +
						'*/',
					pattern: 'website/build/components/requirejs/*.js',
					cwd: 'website/build/components/requirejs',
					out: 'website/build/components/requirejs/'
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
					"dist/jidejs/default.css": "style/default.less"
				}
			},
			demos: {
				files: {
					"demo/apps/email/style.css": "demo/apps/email/style.less",
					"demo/apps/contacts/style.css": "demo/apps/contacts/style.less",
					"demo/apps/issues/style.css": "demo/apps/issues/style.less"
				}
			}
		},

		copy: {
			debug: {
				files: [
					{src: ['components/**'], dest: 'website/build/'},
					// copy demos
					{src: ['demo/**'], dest: 'website/build/'},
					// copy minified jidejs
					{src: ['**/*'], dest: 'website/build/jidejs/', cwd: 'jidejs', expand: true}
				]
			},
			website: {
				files: [
					{src: ['components/**'], dest: 'website/build/'},
					// copy demos
					{src: ['demo/**'], dest: 'website/build/'},
					// copy minified jidejs
					{src: ['**/*'], dest: 'website/build/jidejs/', cwd: 'dist/jidejs', expand: true}
				]
			},
			themes: {
				files: [
					{src: ['**/*.less'], dest: 'dist/themes/', cwd: 'style', expand: true}
				]
			}
		},

		compress: {
			free: {
				options: {
					archive: 'jidejs-<%=pkg.version%>.zip'
				},
				files: [
					{src: ['**/*'], dest: '', cwd: 'dist', expand: true}
				]
			}
		},

		jsdoc : {
			dist : {
				jsdoc: 'jsdoc-master',
				options: {
					destination: 'website/build/api',
					configure: 'jsdoc/conf.json'
				},
				files: [
					{src: ['jidejs/**/*.js']}
				]
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-jsdoc');

	// This task starts the wintersmith command to build the website.
	grunt.registerTask('wintersmith', function() {
		var spawn = require('child_process').exec,
			done = this.async();
		var child = spawn('wintersmith build', {
			cwd: 'website'
		}, function(error, stdout, stderr) {
			grunt.verbose.writeln(stdout.toString());
			grunt.verbose.writeln(stderr.toString());
			if(error) {
				grunt.log.error(error);
				done(false);
				return;
			}
		});
		child.on('exit', function(code) {
			if(code === 0) done(true);
			else {
				grunt.log.error('wintersmith not run successfully');
				done(false);
			}
		})
	});

	grunt.registerTask('compile:examples', function() {
		var done = this.async();
		examples.compile('docs/examples', 'website/contents/examples/examples.js', done);
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
		'minify:source', 'less:controls', 'less:demos', 'copy:themes'
	]);

	// build the website
	grunt.registerTask('website', [
		'build', 'jsdoc', 'compile:examples', 'wintersmith', 'copy:website', 'minify:requirejs'
	]);

	grunt.registerTask('website-no-doc', [
		'build', 'compile:examples', 'wintersmith', 'copy:website', 'minify:requirejs'
	]);

	grunt.registerTask('website:debug', [
		'build', 'compile:examples', 'wintersmith', 'copy:debug'
	]);

	// the default task is to build everything
	grunt.registerTask('default', ['website']);

	// start a web server to preview the website
	grunt.registerTask('website-preview', ['website', 'wintersmith'], function() {
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
			, path = require('path');

		var app = express();
		app.use(express.favicon());
		app.use(express.logger('dev'));
		app.use(express.compress());
		app.use('/jidejs', express.static(__dirname+'/jidejs'));
		app.use('/jidejs', express.static(__dirname+'/style'));
		app.use('/demo', express.static(__dirname+'/demo'));
		app.use('/components', express.static(__dirname+'/components'));
		app.listen(3000).on('close', done);
		console.log('Server started at port '+3000);
	});
};