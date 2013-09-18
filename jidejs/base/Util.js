/**
 * Created with JetBrains WebStorm.
 * User: pago
 * Date: 24.09.12
 * Time: 08:15
 * To change this template use File | Settings | File Templates.
 */
define('jidejs/base/Util', function() {
	function Util() {}

	var toString = Object.prototype.toString,
		slice = Array.prototype.slice;

	Util.isFunction = Util.isNumber = Util.isString = null;
	['Number', 'String', 'Function', 'Boolean'].forEach(function(name) {
		Util['is'+name] = function(obj) {
			return toString.call(obj) === '[object '+name+']';
		};
	});

	Util.isObject = function(obj) {
		return obj === Object(obj);
	};

	Util.isElement = function(obj) {
		return obj && 'nodeType' in obj;
	};

	Util.copy = function(obj, fn, context) {
		Object.getOwnPropertyNames(obj).forEach(function(name) {
			fn.call(context, name, obj[name]);
		});
	};

	Util.forEach = function(obj, fn, context) {
		if(Array.isArray(obj)) {
			obj.forEach(fn, context);
		} else {
			Object.getOwnPropertyNames(obj).forEach(function(name) {
				fn.call(context, name, obj[name]);
			});
		}
	};

	Util.defaults = function(obj) {
		slice.call(arguments, 1).forEach(function(source) {
			for(var prop in source) {
				if(source.hasOwnProperty(prop) && obj[prop] == null) {
					obj[prop] = source[prop];
				}
			}
		});
		return obj;
	};

	Util.extends = function(obj) {
		slice.call(arguments, 1).forEach(function(source) {
			Object.getOwnPropertyNames(source).forEach(function(name) {
				var desc = Object.getOwnPropertyDescriptor(source, name);
				Object.defineProperty(obj, name, desc);
			});
		});
		return obj;
	};

	Util.privateProperty = function(obj, name, value) {
		Object.defineProperty(obj, name, { value: value, configurable: true, writable: true });
	};

	Util.debounce = function(func, wait, immediate) {
		var timeout;
		return function() {
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	};

	Util.throttle = function(func, wait) {
		var isRunning = false, context, args;
		return function() {
			context = this;
			args = arguments;
			if(!isRunning) {
				var later = function() {
					isRunning = false;
					func.apply(context, args);
				};
				setTimeout(later, wait);
				isRunning = true;
			}
		};
	};

	Util.asArray = Array.from ? function(arrayLike) {
		return Array.from(arrayLike);
	} : function(arrayLike) {
		return slice.call(arrayLike);
	};

	Util.getPropertyDescriptor = function(obj, name) {
		if(name in obj) {
			var descriptor = null;
			while(!descriptor) {
				descriptor = Object.getOwnPropertyDescriptor(obj, name);
				if(!descriptor) {
					obj = Object.getPrototypeOf(obj);
				}
			}
			return descriptor;
		}
		return null;
	};

	return Util;
});