/**
 * Represents an Issue.
 */
define(['jidejs/base/ObservableProperty', './User'], function(ObservableProperty, User) {
	"use strict";
	function Issue(original) {
		installer(this);
		this._issue = original;
		this.title = original.title;
		this.body = parseMarkdown(original.body);
		this.issueUrl = original.html_url;
		this.number = original.number;
		this.state = original.state;
		this.assignee = User.getOrCreate(original.assignee);
		this.user = User.getOrCreate(original.user);
		this.commentCount = original.comments;
		this.createdAt = original.created_at;
		this.updatedAt = original.updated_at;
		this.closedAt = original.closed_at;
		// this variable is required for the Handlebars template
		this.singleComment = this.commentCount === 1;
	}
	var installer = ObservableProperty.install(Issue,
		'title', 'body', 'issueUrl', 'number', 'state',
		'assignee', 'user', 'commentCount',
		'createdAt', 'updatedAt', 'closedAt');

	function parseMarkdown(text) {
		return markdown.toHTML(text, 'Maruku', {
			preprocessTreeNode: function(jsonml) {
				// Github has a special flavour of Markdown that makes it possible to use inline code markup for block code
				// since parsing Markdown is outside of the scope of this demo, we do the best we can by converting
				// all code occurances to code blocks.
				if(jsonml[0] === 'inlinecode') {
					jsonml[0] = 'code_block';
				}
				return jsonml;
			}
		});
	}

	return Issue;
});