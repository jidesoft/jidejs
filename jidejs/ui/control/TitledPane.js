/**
 * A TitledPane is a control that combines a content component with a title. It can optionally be configured to be
 * {@link #collapsible} which allows the user to collapse the content of the pane so that only the title is visible.
 *
 * A common use case is to group multiple TitledPanes into an {@link module:jidejs/ui/control/Accordion} so that only
 * one of them can be expanded at a given time.
 *
 * @module jidejs/ui/control/TitledPane
 * @extends module:jidejs/ui/Control
 */
define([
	'jidejs/base/Class', 'jidejs/base/DOM', 'jidejs/base/Util', 'jidejs/base/Animation', 'jidejs/base/ObservableProperty', 'jidejs/base/Dispatcher',
	'jidejs/ui/Component', 'jidejs/ui/Control', 'jidejs/ui/Skin', 'jidejs/ui/control/Label'
], function(Class, DOM, _, Animation, Observable, Dispatcher, Component, Control, Skin, Label) {
	var doc = document;
	var template = (function() {
		var frag = doc.createDocumentFragment();
		var title = doc.createElement('header');
		frag.appendChild(title);
		var content = doc.createElement('div');
		content.className = 'jide-titledpane-content';
		frag.appendChild(content);
		return frag;
	}());

	function TitledPaneSkin(titledPane, el) {
		if(typeof el === 'undefined') {
			el = doc.createElement('div');
		}
		this.titledPane = titledPane;
		this.element = el;
		Skin.call(this, titledPane, el);

		el.appendChild(template.cloneNode(true));
		this.title = new Label({element:el.children[0]});
		this.title.classList.add('jide-titledpane-title');
		this.content = el.children[1];
		this.collapseHandlerRegistered = false;

		this.collapseHandler = function() {
			this.expanded = !this.expanded;
		}.bind(titledPane);
	}

	Class(TitledPaneSkin).extends(Skin).def({
		install: function() {
			Skin.prototype.install.call(this);
			var titledPane = this.titledPane;
			var THIS = this;

			var collapsibleChangedHandler = function(event) {
				if(event.value && !THIS.collapseHandlerRegistered) {
					THIS.title.on('click', THIS.collapseHandler);
					THIS.collapseHandlerRegistered = true;
				} else if(!event.value && THIS.collapseHandlerRegistered) {
					THIS.title.off('click', THIS.collapseHandler);
					THIS.collapseHandlerRegistered = false;
				}
			};

			function expandedChangedHandler(event) {
				var expand = event.value;
				if(!titledPane.content) {
					titledPane.classList[expand ? 'add' : 'remove']('jide-expanded');
					return;
				}
				if(expand) {
					titledPane.classList.add('jide-expanded');
				}
				var size = DOM.measure(titledPane.content.element, true);
				var fullHeight = size.height;
				// in case the node isn't yet part of the DOM, so we will just delay that a little bit
				if(fullHeight === 0 && expand) {
					Dispatcher.nextTick(function() {
						THIS.content.style.height = DOM.measure(titledPane.content.element).height;
					});
					return;
				}
				var requestLayout = titledPane.parent && titledPane.parent.requestLayout
					? function() { titledPane.parent.requestLayout(); titledPane.parent.layout(); }
					: function() {};
				var content = THIS.content;
				if(titledPane.animated && size.height === fullHeight) {
					Animation.cssTransition({
						element: content,
						property: 'height',
						start:  expand ? 0          : fullHeight,
						target: expand ? fullHeight : 0,
						unit: 'px',
						method: Animation.linear,
						duration: 500
					}).then(function() {
						if(!expand) {
							titledPane.classList.remove('jide-expanded');
						}
						requestLayout();
					});
				} else {
					if(!expand) {
						titledPane.classList.remove('jide-expanded');
						content.style.height = "0px";
					} else {
						content.style.height = fullHeight+"px";
					}
					requestLayout();
				}
			}

			this.bindings = [
				this.title.textProperty.bindBidirectional(titledPane.titleProperty),
				titledPane.contentProperty.subscribe(function(event) {
					var value = event.value;
					if(event.oldValue) {
						var oldValue = event.oldValue;
						oldValue.parent = null;
						this.content.replaceChild(value.element, oldValue.element);
					} else {
						this.content.appendChild(value.element);
					}
					value.parent = this.titledPane;
					Dispatcher.requestAnimationFrame(function() {
						if(titledPane.animated) {
							titledPane.classList.remove('jide-titledpane-animated');
						}
						var size = DOM.measure(value.element);
						if(size.height) {
							THIS.content.style.height = titledPane.expanded ? size.height+"px" : "0px";
						}
						if(titledPane.animated) {
							Dispatcher.requestAnimationFrame(function() {
								titledPane.classList.add('jide-titledpane-animated');
							});
						}
					});
				}.bind(this)),
				titledPane.expandedProperty.subscribe(expandedChangedHandler),
				titledPane.collapsibleProperty.subscribe(collapsibleChangedHandler),
				titledPane.animatedProperty.subscribe(function(event) {
					if(event.value) {
						titledPane.classList.add('jide-titledpane-animated');
					} else {
						titledPane.classList.remove('jide-titledpane-animated');
					}
				})
			];
			if(titledPane.content) {
				this.content.appendChild(titledPane.content.element);
			}
			expandedChangedHandler({value: titledPane.expanded});
			collapsibleChangedHandler({value: titledPane.collapsible});
			if(titledPane.animated) titledPane.classList.add('jide-titledpane-animated');
		},

		dispose: function() {
			this.bindings.forEach(function(binding) {
				binding.dispose();
			});
			this.bindings = [];
		}
	});

	/**
	 * Creates a new TitledPane.
	 * @memberof module:jidejs/ui/control/TitledPane
	 * @param {object} config The configuration.
	 * @constructor
	 * @alias module:jidejs/ui/control/TitledPane
	 */
	function TitledPane(config) {
		installer(this);
		config = config || {};
		if(!config.skin) {
			config.skin  = new TitledPaneSkin(this, config.element);
		}
		_.defaults(config, { expanded: true, collapsible: true, animated: true });
		Control.call(this, config);
		this.classList.add('jide-titledpane');
	}

	Class(TitledPane).extends(Control).def({
		dispose: function() {
			Control.prototype.dispose.call(this);
			installer.dispose(this);
		},

		/**
		 * The title of the component.
		 * @type string
		 */
		title: '',
		/**
		 * The title of the component.
		 * @type module:jidejs/base/ObservableProperty
		 */
		titleProperty: null,
		/**
		 * The component that is displayed in the group.
		 * @type module:jidejs/ui/Component
		 */
		content: null,
		/**
		 * The component that is displayed in the group.
		 * @type module:jidejs/base/ObservableProperty
		 */
		contentProperty: null,
		/**
		 * When `true`, the user can collapse the {@link module:jidejs/ui/control/TitledPane#content} of the pane so that
		 * only the {@link module:jidejs/ui/control/TitledPane#title} is visible.
		 * @type boolean
		 */
		collapsible: true,
		/**
		 * When `true`, the user can collapse the {@link module:jidejs/ui/control/TitledPane#content} of the pane so that
		 * only the {@link module:jidejs/ui/control/TitledPane#title} is visible.
		 * @type module:jidejs/base/ObservableProperty
		 */
		collapsibleProperty: null,
		/**
		 * `true`, if the {@link #content} is currently expanded; `false`, if it is collapsed.
		 * @type boolean
		 * @see module:jidejs/ui/control/TitledPane#collapsible
		 */
		expanded: true,
		/**
		 * `true`, if the {@link #content} is currently expanded; `false`, if it is collapsed.
		 * @see module:jidejs/ui/control/TitledPane#collapsibleProperty
		 * @type module:jidejs/base/ObservableProperty
		 */
		expandedProperty: null,
		/**
		 * `true`, if the control should use an animation to while expanding or collapsing the content; `false`,
		 * otherwise.
		 * @type boolean
		 */
		animated: true,
		/**
		 * `true`, if the control should use an animation to while expanding or collapsing the content; `false`,
		 * otherwise.
		 * @type module:jidejs/base/ObservableProperty
		 */
		animatedProperty: null
	});
	var installer = Observable.install(TitledPane, 'title', 'content', 'collapsible', 'expanded', 'animated');

	return TitledPane;
});