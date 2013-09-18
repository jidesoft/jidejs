// we need a global callback for JSONP, this is it
var issues_callback;

/**
 * A Dependency that contains all issues that were imported from Github.
 */
define([
	'jidejs/base/ObservableList', './bus', './Issue'
], function(ObservableList, eventbus, Issue) {
	"use strict";
	// We want to use the same ObservableList everywhere across the app
	var issues = new ObservableList();

	// define the previously mentioned callback, it needs access to both, the issues and the eventbus
	issues_callback = function(res) {
		var meta = res.meta;
		// verify that the response is valid
		if(meta.status !== 200) {
			eventbus.emit('github:error', meta);
			return;
		}
		// notify the app that the API call limits changed
		eventbus.emit('meta:apicall', {
			limit: meta['X-RateLimit-Limit'],
			remaining: meta['X-RateLimit-Remaining']
		});
		// insert data into the issue list
		issues.addAll(res.data.map(function(issue) { return new Issue(issue); }));
	};

	function githubRequest(url) {
		var script = document.createElement('script');
		script.src = url;
		document.head.appendChild(script);
	}

	githubRequest('https://api.github.com/repos/joyent/node/issues?callback=issues_callback');

	return issues;
});