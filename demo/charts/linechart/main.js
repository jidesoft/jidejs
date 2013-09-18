// configure requirejs to load jide.js library
require.config({
	"packages": [{
		name: 'jidejs/base',
		location: '../../../base/src/jidejs/base'
	}, {
		name: 'jidejs/ui',
		location: '../../../controls/src/jidejs/ui'
	}, {
		name: 'jidejs/grid',
		location: '../../../grid/src/jidejs/grid'
	}, {
		name: 'jidejs/chart',
		location: '../../../chart/src/jidejs/chart'
	}]
});

require([
	'jidejs/base/Class',
	'jidejs/base/ObservableProperty',
	'jidejs/base/ObservableList',
	'jidejs/base/DOM',
	'jidejs/base/Util',
	'jidejs/ui/control/Tooltip',
	'jidejs/ui/control/HTMLView',
	'jidejs/ui/control/Button',
	'jidejs/chart/Chart',
	'jidejs/chart/LineRenderer',
	'jidejs/chart/Axis'
], function(
	Class, ObservableProperty, ObservableList, DOM, _,
	Tooltip, HTMLView, Button,
	Chart, LineRenderer, Axis
) {
	"use strict";

	function random(min, max) {
		return min + Math.floor(Math.random() * (max-min));
	}

	//region Data model
	var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	function Balance(month, revenue, expenditure) {
		this.monthProperty = ObservableProperty.define(this, 'month', month);
		this.revenueProperty = ObservableProperty.define(this, 'revenue', revenue);
		this.expenditureProperty = ObservableProperty.define(this, 'expenditure', expenditure);
	}
	Class(Balance).def({
		get monthString() {
			return months[(this.month-1)%12];
		},

		month: 0,
		revenue: 0,
		expenditure: 0
	});
	ObservableProperty.install(Balance, 'month', 'revenue', 'expenditure');

	var lastMonth = 1;
	var dataPoints = ObservableList([
		new Balance(lastMonth++, 0, 1000),
		new Balance(lastMonth++, 500, 500),
		new Balance(lastMonth++, 1500, 500),
		new Balance(lastMonth++, 2000, 500),
		new Balance(lastMonth++, 2000, 250),
		new Balance(lastMonth++, 2500, 500),
		new Balance(lastMonth++, 2000, 500),
		new Balance(lastMonth++, 2500, 1000),
		new Balance(lastMonth++, 3000, 500),
		new Balance(lastMonth++, 2000, 1500),
		new Balance(lastMonth++, 3500, 100),
		new Balance(lastMonth++, 3500, 100),
	]);
	//endregion

	var chart = new Chart({
		width: 800,
		height: 600,
		data: dataPoints,
		xAxis: new Axis({
			direction: Axis.HORIZONTAL,
			intervalSize: 100,
			labels: dataPoints,
			convert: function(index) {
				return this.labels.get(index).monthString;
			}
		}),
		yAxis: new Axis({
			direction: Axis.VERTICAL,
			minimum: -1000,
			maximum: 5000,
			interval: 500
		}),
		renderers: [
			new LineRenderer({
				convert: function(item) {
					return item.revenueProperty;
				}
			}),
			new LineRenderer({
				pointFillColor: 'red',
				convert: function(item) {
					return item.expenditureProperty;
				}
			}),
			new LineRenderer({
				pointFillColor: 'yellow',
				convert: function(item) {
					return item.revenueProperty.subtract(item.expenditureProperty);
				}
			})
		],
		updateTooltipContent: function(tooltip, item) {
			tooltip.content = '<b>Revenue:</b> '+item.revenue+
							  '<br><b>Expenditure: </b>'+item.expenditure+
							  '<br><b>Balance:</b> '+(item.revenue-item.expenditure);
		}
	});
	document.body.appendChild(chart.element);

	document.body.appendChild(new Button({
		text: 'Change revenue',
		on: {
			action: function() {
				dataPoints.get(random(0, dataPoints.length-1)).revenue = random(100, 4500);
			}
		}
	}).element);

	document.body.appendChild(new Button({
		text: 'Add entry',
		on: {
			action: function() {
				dataPoints.add(new Balance(lastMonth++, random(1000, 4500), random(0, 2000)));
			}
		}
	}).element);

	document.body.appendChild(new Button({
		text: 'Add 10,000 entries',
		on: {
			action: function() {
				var i = 0,
					generator = function() {
						var items = [];
						for(var len = Math.min(i+50, 10000); i < len; i++) {
							items[items.length] = new Balance(lastMonth++, random(1000, 4500), random(0, 2000));
						}
						dataPoints.addAll(items);
						if(i < 10000) {
							setTimeout(generator, 500);
						}
					};
				setTimeout(generator, 500);
			}
		}
	}).element);
});