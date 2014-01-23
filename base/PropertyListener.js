/**
 * Created with JetBrains WebStorm.
 * User: patri_000
 * Date: 15.11.12
 * Time: 10:03
 * To change this template use File | Settings | File Templates.
 */
define(function() {
	function PropertyListener(property, handler, context) {
		if(!property || !handler) throw new Error('Expected at least a property and the handler as arguments.');
		this.property = property;
		this.handler = handler;
		if(arguments.length === 3) {
			this.context = context;
		} else {
			this.context = undefined;
		}
	}
	PropertyListener.prototype.dispose = function() {
		if(!this.property || !this.handler) return;
		if(this.context) {
			this.property.unsubscribe(this.handler, this.context);
		} else {
			this.property.unsubscribe(this.handler);
		}
		this.context = null;
		this.handler = null;
		this.property = null;
	};
	PropertyListener.prototype.call = function(context, value, evt) {
		if(this.context) {
			this.handler.call(this.context, value, evt);
		} else {
			this.handler.call(context, value, evt);
		}
	};
	PropertyListener.prototype.is = function(handler, context) {
		return context === this.context && handler === this.handler;
	};
	return PropertyListener;
});