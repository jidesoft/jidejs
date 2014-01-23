//region configure requirejs to load jide.js library
require.config({
	"packages": [{
		name: 'jidejs',
		location: '/bower_components/jidejs'
	}],
    paths: {
        text: '/bower_components/requirejs-text/text'
    }
});
//endregion

//  format an ISO date using Moment.js
//  http://momentjs.com/
//  moment syntax example: moment(Date("2011-07-18T15:50:52")).format("MMMM YYYY")
//  usage: {{dateFormat creation_date format="MMMM YYYY"}}
//  source: https://gist.github.com/stephentcannon/3409103
Handlebars.registerHelper('dateFormat', function(context, block) {
	if (window.moment) {
		var f = block.hash.format || "MMM DD, YYYY hh:mm:ss A";
		return moment(context).format(f); //had to remove Date(context)
	}else{
		return context;   //  moment plugin not available. return data as is.
	}
});

require([
	'./lib/bus', './lib/issues', './lib/app'
], function(
	eventBus, issues, app
) {
	"use strict";

	// we want to connect the EventBus with the issues so that we're notified when new issues are added or old ones are removed.
	issues.on('change', function(event) {
		var changes = event.enumerator();
		while(changes.moveNext()) {
			var change = changes.current;
			if(change.isInsert) {
				eventBus.emit('issue:added', change.newValue);
			} else if(change.isDelete) {
				eventBus.emit('issue:removed', change.oldValue);
			} else if(change.isUpdate) {
				eventBus.emit('issue:updated', {
					newValue: change.newValue,
					oldValue: change.oldValue
				});
			}
		}
	});

	document.body.appendChild(app.element);
});