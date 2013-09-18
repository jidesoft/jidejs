"use strict";
var Cheerio = require('cheerio')
	, fs = require('fs')
	, path = require('path');

function mkdirpSync(path) {
	console.log('mkdirp '+path);
	if(!fs.existsSync(path)) fs.mkdirSync(path);
}

function linkTo(text) {
	return text.replace((/\{@link\s+([^\}]+)\}/g), function(match) {
		var c = RegExp.$1, url;
		if(c in urlmapping) url = urlmapping[c];
		else if(('module:'+c) in urlmapping) url = urlmapping['module:'+c];
		else {
			console.log("Couldn't find mapping for "+c);
			return match;
		}
		return '<a href="../api/'+url+'">'+RegExp.$1+'</a>';
	});
}

function loadExample(file, id, example, callback) {
	fs.readFile(file, 'utf-8', function(err, content) {
		if(err) callback(err);
		else if(content) {
			var $ = Cheerio.load(content);
			$('[data-role]').each(function() {
				var $el = $(this);
				example[$el.attr('data-role')] = linkTo($el.html().trim());
			});
//			updateExamplePage(path.join(__dirname, 'docs', 'examples', 'index.html'), id, example, function(err, output) {
//				if(err) {
//					console.error(err);
//				} else {
//					console.log('Successfully created '+output);
//				}
//			});
			callback(null, example);
		}
	});
}

function updateExamplePage(template, exampleId, example, callback) {
	fs.readFile(template, 'utf-8', function(err, content) {
		if(err) return callback(err);

		var $ = Cheerio.load(content);
		$('[data-role]').each(function() {
			var $el = $(this);
			var id = $el.attr('data-role');
			if(example.hasOwnProperty(id)) {
				$el.html(example[id]);
			} else {
				if(id === 'jseditor') {
					$el.append('<pre class="CodeMirror">'+example.js+'</pre>');
				} else if(id === 'output') {
					$el.append(example.html);
				}
			}
		});
		var nav = $('#demo_nav');
		nav.find('li.active').removeClass('active');
		nav.find('a[href="#!/'+exampleId+'"]').parent().addClass('active');
		$('[data-example]').attr('data-example', exampleId);
		$('body').append('<script>$(function() {var root = document.querySelector(\'[data-role="output"]\'); '+example.js+'});</script>');

		// make link paths absolute
		$('link').each(function() {
			var $link = $(this);
			var path = $link.attr('href');
			if(path.match(/^\.\./)) {
				$link.attr('href', '/jide.css');
			} else {
				$link.attr('href', '/'+path);
			}
		});
		// fix script import
		$('script[src]').each(function() {
			var $script = $(this);
			var src = $script.attr('src');
			if(!src.match(/^http:/)) {
				$script.attr('src', '/'+src);
			}
		});
		// fix require.js config, don't need one when we've got a server
		$('#require_config').remove();
		$('script[data-main]').attr('data-main', '/docs.js');

//		mkdirpSync(path.join(__dirname, 'demo', 'static'));
//		mkdirpSync(path.join(__dirname, 'demo', 'static', exampleId.split(/\//)[0]));
//		fs.writeFile(path.join(__dirname, 'demo', 'static', exampleId), $.html(), 'utf-8', function(err) {
//			if(err) return callback(err);
//			else callback(path);
//		})
	});
}

var urlmapping;
function loadExamples(root, callback) {
	var examples = {};
	urlmapping = require('./dist/docs/api/urlmapping');
	fs.readdir(root, function(err, files) {
		if(err) return callback(err);
		var categoryCounter = files.length;
		for(var i = 0, len = files.length; i < len; i++) {
			var file = files[i];
			if(file.indexOf('.') > 0) continue;
			fs.readdir(path.join(root, file), function(category, err, files) {
				if(err) return callback(err);
				categoryCounter--;
				var exampleCounter = files.length;
				for(var i = 0, len = files.length; i < len; ++i) {
					var file = files[i];
					var exampleId = category+'/'+file;
					var example = {};
					examples[exampleId] = example;
					loadExample(path.join(root, category, file), exampleId, example, function(err, example) {
						if(err) callback(err);
						else if(example) {
							exampleCounter--;
							if(exampleCounter === 0) {
								callback(null, examples);
							}
						}
					});
				}
			}.bind(null, file))
		}
	});
}

exports.compile = function(input, output, callback) {
	loadExamples(input, function(err, examples) {
		if(err) return callback(err);
		fs.writeFile(output, "define(function() { return "+JSON.stringify(examples)+"; });", 'utf-8', function(err) {
			if(err) return callback(err);
			callback(null);
		});
	})
};

var input = path.join(__dirname, 'docs', 'examples')
	, output = path.join(__dirname, 'docs', 'examples', 'examples.js')
	, defaultExample = 'simple/Button.html';

//loadExamples(input, function(err, examples) {
//	if(err) {
//		console.error(err);
//		return;
//	}
//	fs.writeFile(output, "define(function() { return "+JSON.stringify(examples)+"; });", 'utf-8', function(err) {
//		if(err) {
//			console.error(err);
//		} else {
//			console.log('Successfully created '+output);
//		}
//	});
//});