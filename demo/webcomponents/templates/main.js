//region configure requirejs to load jide.js library
require.config({
	"packages": [{
		name: 'jidejs',
		location: '../../../jidejs'
	}],
	paths: {
		text: '../../../components/requirejs-text/text'
	}
});
//endregion

var jidejs = { customElementsEnabled: true };

define('jidejs/ui/mixin/Selection', [
	'jidejs/base/Class', 'jidejs/ui/control/SingleSelectionModel'
], function(Class, SingleSelectionModel) {
	function Selection(config, selectables, requireSelectedItem) {
		if(!config.selectionModel) config.selectionModel = new SingleSelectionModel(selectables, requireSelectedItem);
	}
	Class(Selection).def({
		selectionModel: null,
		get selectedItem() {
			return this.selectionModel.selectedItem;
		},

		set selectedItem(item) {
			this.selectionModel.selectedItem = item;
		},

		get selectedIndex() {
			return this.selectionModel.selectedIndex;
		},

		set selectedIndex(index) {
			this.selectionModel.selectedIndex = index;
		}
	});
	return Selection;
});

require([
	'jidejs/base/Class', 'jidejs/base/Util', 'jidejs/base/Observable', 'jidejs/base/ObservableProperty',
	'jidejs/base/ObservableList',
	'jidejs/ui/Control', 'jidejs/ui/Skin', 'jidejs/ui/bind', 'jidejs/ui/Template', 'jidejs/ui/register',
	'jidejs/ui/mixin/Selection', 'text!TabView.html',
	'jidejs/ui/control/Button'
], function(
	Class, _, Observable, ObservableProperty, ObservableList,
	Control, Skin, bind, Template, register, SelectionMixin, TabViewTemplate,
	Button
) {
	function TabPane(config) {
		if(!config) config = {};
		this.children = ObservableList(config.children);
		delete config.children;
		SelectionMixin.call(this, config, this.children, true);
		Control.call(this, config);
		this.classList.add('jide-tabpane');
	}
	Class(TabPane).extends(Control).mixin(SelectionMixin).def({

	});
	TabPane.Skin = Skin.create(Skin, {
		template: TabViewTemplate,

		install: function() {
			Skin.prototype.install.call(this);
			var tabPane = this.component,
				selectionModel = tabPane.selectionModel;
//			this.on('x-tab-container', {
//				click: function(event) {
//					var selectedItem = bind.context(event.target).$item;
//					selectionModel.select(selectedItem);
//				}
//			});
		},

		setSelectedItem: function(item) {
			this.component.selectionModel.select(item);
		}
	});
	register('jide-tabpane', TabPane, Control, ['selectedItem', 'selectedIndex', 'selectionModel'], []);

	var myTabPane = new TabPane({
		children: [
			{ title: 'Tab 1', content: 'Hello World', selected: true },
			{ title: 'Tab 2', content: 'Hello Universe', selected: false }
		]
	});
	document.body.appendChild(myTabPane.element);

	new Button({ element: document.getElementById('somebutton') });
});