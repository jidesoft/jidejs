/**
 * The ListView control can be used to display a list of items to the user. If there is not enough space to display
 * the items, it will automatically use a scroll container.
 *
 * @example Simple usage
 * 	new ListView({
 * 	    items: myPersonDataArray,
 * 	    cellFactory: function(listView) {
 * 	    	return new Cell({
 * 	    	 updateItem: function(person) {
 * 	    	 	// release previous bindings
 * 					if(this._myBindings) this._myBindings.forEach(function(binding) { binding.dispose(); });
 * 					// create new bindings
 * 					this._myBindings = [
 * 						this.graphicsProperty.bind(person.pictureProperty),
 * 						this.textProperty.bind(person.fullNameProperty)
 * 					];
 * 	    	 }
 * 	    	});
 * 	    }
 * 	});
 *
 * @module jidejs/ui/control/ListView
 * @extends module:jidejs/ui/Control
 */
define([
	'./../.././Class', './../.././Observable', './../.././ObservableProperty', './../.././ObservableList', './../Control',
	'./../Skin', './Cell', './MultipleSelectionModel', './../Component',
	'./../Orientation', './../.././Util', './../.././DOM', './../register'
], function(
	Class, Var, Observable, ObservableList, Control, Skin, Cell, MultipleSelectionModel, Component, Orientation, _, DOM, register
) {
	//region ListViewSkin
	function ListViewSkin(listView, element) {
		Skin.call(this, listView, element);
	}
	Class(ListViewSkin).extends(Skin).def({
		defaultElement: 'ul',
		bindings: null,
		install: function() {
			var listView = this.component;
            if(listView.orientation === Orientation.HORIZONTAL) {
                listView.classList.add('jide-orientation-horizontal');
            } else {
                listView.classList.remove('jide-orientation-horizontal');
            }
			this.bindings = [
				listView.items.on('change', function(event) {
					var changes = event.enumerator(),
						el = listView.element,
						i = 0, len = 0, child = null;
					while(changes.moveNext()) {
						var change = changes.current;
						if(change.isUpdate) {
							child = Component.fromElement(el.children[change.index].firstChild);
							child.item = change.newValue;
						} else if(change.isDelete) {
							var element = el.children[change.index];
							el.removeChild(element);
							Component.fromElement(element.firstChild).dispose();
							listView.selectionModel.clearSelection(change.index);
						} else {
							child = listView.cellFactory(listView);
							child.parent = listView;
							child.item = change.newValue;
							var li = document.createElement('li');
							li.appendChild(child.element);
							if(el.children.length > change.index) {
								el.insertBefore(li, el.children[change.index]);
							} else {
								el.appendChild(li);
							}
						}
					}
				}),
				listView.on({
					orientation: function(event) {
						if(event.value === Orientation.HORIZONTAL) {
							listView.classList.add('jide-orientation-horizontal');
						} else {
							listView.classList.remove('jide-orientation-horizontal');
						}
					},
					click: function(e) {
						// we need to traverse all children to find the appropriate index
						// since we can't be sure which HTML element was clicked and it doesn't necessarily have
						// to be one that is directly a component
						var el = e.target;
						var listElement = listView.element;
						for(var i = 0, len = listElement.children.length; i < len; i++) {
							var liElement = listElement.children[i];
							if(liElement.contains(el)) {
								var selectionModel = listView.selectionModel;
								if(e.ctrlKey) {
									if(selectionModel.isSelected(i)) {
										selectionModel.clearSelection(i);
									} else {
										selectionModel.select(i);
									}
								} else {
									if(selectionModel.isSelected(i)) {
										selectionModel.clearSelection();
									} else {
										selectionModel.clearAndSelect(i);
									}
								}
								return false;
							}
						}
						return true;
					},
					key: {
						'ctrl a': function(e) {
							var selectionModel = listView.selectionModel;
							selectionModel.selectAll && selectionModel.selectAll();
							e.preventDefault();
							e.stopPropagation();
						},
						Down: function() {
							listView.selectionModel.selectNext();
						},
						Up: function() {
							listView.selectionModel.selectPrevious();
						}
					}
				})
			];
			var selectionModel = listView.selectionModel;
			if(selectionModel instanceof MultipleSelectionModel) {
				this.bindings.push(selectionModel.selectedIndices.on('change', function(event) {
					var changes = event.enumerator(),
						childNodes = listView.element.childNodes,
						index, cell;
					while(changes.moveNext()) {
						var change = changes.current;
						if(change.oldValue !== undefined) {
							index = change.oldValue;
							if(index < childNodes.length) {
								cell = Component.fromElement(childNodes[index].firstChild);
								cell.selected = false;
							}
						}
						if(change.newValue !== undefined) {
							index = change.newValue;
							cell = Component.fromElement(childNodes[index].firstChild);
							cell.selected = true;
						}
					}
				}));
			} else {
				this.bindings.push(selectionModel.selectedIndexProperty.subscribe(function(evt) {
					var childNodes = listView.element.childNodes;
					if(evt.oldValue !== null && childNodes[evt.oldValue]) {
						Component.fromElement(childNodes[evt.oldValue].firstChild).selected = false;
					}
					if(evt.value !== null) {
						var childNode = childNodes[evt.value];
						if(!childNode) return;
						var cell = Component.fromElement(childNode.firstChild);
						if(cell) {
							cell.selected = true;
							DOM.scrollIntoViewIfNeeded(cell.element);
//							if(cell.element.scrollIntoViewIfNeeded) cell.element.scrollIntoViewIfNeeded();
//							else cell.element.scrollIntoView();
						}
					}
				}));
				if(!selectionModel.empty) {
					var childNodes = listView.element.childNodes;
					if(childNodes[selectionModel.selectedIndex]) {
						Component.fromElement(childNodes[selectionModel.selectedIndex].firstChild).selected = true;
					}
				}
			}
		},

		initialize: function() {
			var listView = this.component, selectionModel = listView.selectionModel;
			// add list items
			var frag = document.createDocumentFragment();
			for(var i = 0, len = listView.items.length; i < len; i++) {
				var child = listView.cellFactory(listView);
				child.parent = listView;
				//if(i === selectionModel.) child.index = i;
				child.item = listView.items.get(i);
				if(selectionModel.isSelected(i)) child.selected = true;
				var li = document.createElement('li');
				li.appendChild(child.element);
				frag.appendChild(li);
			}
			listView.element.appendChild(frag);
		}
	});
//endregion

	/**
	 * Creates a new ListView.
	 * @memberof module:jidejs/ui/control/ListView
	 * @param {object} config The configuration.
	 * @param {Array} config.items The items displayed by this ListView.
	 * @constructor
	 * @alias module:jidejs/ui/control/ListView
	 */
	function ListView(config) {
		installer(this);
		config = _.defaults(config || {}, { tabIndex: 0 });
		if(!config.skin) config.skin = new ListViewSkin(this, config.element);

		if(!config.items) this.items = new ObservableList();
		else if(Array.isArray(config.items)) this.items = new ObservableList(Var.unwrap(config.items));
		else this.items = Var.unwrap(config.items); // assume config.items is an ObservableList
		delete config.items;

		if(config.selectionModel) this.selectionModel = Var.unwrap(config.selectionModel);
		else this.selectionModel = new MultipleSelectionModel(this.items);
		delete config.selectionModel;

		Control.call(this, config);
		this.classList.add('jide-listview');
		this.skin.initialize();
	}
	Class(ListView).extends(Control).def({
		dispose: function() {
			Control.prototype.dispose.call(this);
			installer.dispose(this);
		},

		/**
		 * Creates a new Cell for the ListView.
		 *
		 * If you would like to change the display of the ListView, you should override this method and configure
		 * a custom Cell.
		 *
		 * @param {module:jidejs/ui/control/ListView} listView The ListView.
		 * @returns {module:jidejs/ui/control/Cell}
		 */
		cellFactory: function(listView) {
			var cell = new Cell();
			cell.converterProperty.bind(listView.converterProperty);
			return cell;
		},
		/**
		 * The factory that creates a new Cell for the ListView.
		 * @type module:jidejs/base/ObservableProperty
		 * @see module:jidejs/ui/control/ListView#cellFactory
		 */
		cellFactoryProperty: null,
		/**
		 * The converter can be used to easily transform the item to a string and can be used as an alternative
		 * to overriding the {@link module:jidejs/ui/control/ListView#cellFactory} method when all you want is display a string.
		 * @param {*} item The item
		 * @returns {string}
		 */
		converter: function(item) {
			return item && item.toString() || '';
		},
		/**
		 * The converter can be used to easily transform the item to a string and can be used as an alternative
		 * to overriding the {@link module:jidejs/ui/control/ListView#cellFactory} method when all you want is display a string.
		 * @type module:jidejs/base/ObservableProperty
		 */
		converterProperty: null,
		/**
		 * The collection of items displayed by the ListView.
		 *
		 * @type module:jidejs/base/ObservableList
		 * @readonly
		 */
		items: null,
		/**
		 * The SelectionModel used by this ListView.
		 *
		 * @type module:jidejs/ui/control/SelectionModel
		 * @readonly
		 */
		selectionModel: null,

		/**
		 * The orientation of the ListView.
		 *
		 * When `Orientation.VERTICAL` (the default value), the items are displayed in a single column.
		 * Otherwise, if the value is `Orientation.HORIZONTAL`, the items are displayed in a row.
		 *
		 * @type module:jidejs/ui/Orientation
		 */
		orientation: Orientation.VERTICAL,
		/**
		 * The orientation of the ListView.
		 * @see module:jidejs/ui/control/ListView#orientation
		 * @type module:jidejs/base/ObservableProperty
		 */
		orientationProperty: null
	});
	var installer = Observable.install(ListView, 'orientation', 'converter', 'cellFactory');
    register('jide-listview', ListView, Control, ['orientation', 'converter', 'cellFactory', 'selectionModel', 'items'], []);
	return ListView;
});