

Array.prototype.erase = function (item) {
	for (var i = this.length; i--; i) {
		if (this[i] === item) this.splice(i, 1);
	}

	return this;
};

Function.prototype.bind = function (bind) {
	var self = this;
	return function () {
		var args = Array.prototype.slice.call(arguments);
		return self.apply(bind || null, args);
	};
};

merge = function (original, extended) {
	for (var key in extended) {
		var ext = extended[key];
		if (typeof (ext) != 'object' || ext instanceof Class) {
			original[key] = ext;
		} else {
			if (!original[key] || typeof (original[key]) != 'object') {
				original[key] = {};
			}
			merge(original[key], ext);
		}
	}
	return original;
};

function copy(object) {
	if (!object || typeof (object) != 'object' || object instanceof Class) {
		return object;
	} else if (object instanceof Array) {
		var c = [];
		for (var i = 0, l = object.length; i < l; i++) {
			c[i] = copy(object[i]);
		}
		return c;
	} else {
		var c = {};
		for (var i in object) {
			c[i] = copy(object[i]);
		}
		return c;
	}
}

function ksort(obj) {
	if (!obj || typeof (obj) != 'object') {
		return [];
	}

	var keys = [],
		values = [];
	for (var i in obj) {
		keys.push(i);
	}

	keys.sort();
	for (var i = 0; i < keys.length; i++) {
		values.push(obj[keys[i]]);
	}

	return values;
}

// -----------------------------------------------------------------------------
// Class object based on John Resigs code; inspired by base2 and Prototype
// http://ejohn.org/blog/simple-javascript-inheritance/
(function () {
	var initializing = false,
		fnTest = /xyz/.test(function () {
			xyz;
		}) ? /\bparent\b/ : /.*/;

	this.Class = function () {};
	var inject = function (prop) {
		var proto = this.prototype;
		var parent = {};
		for (var name in prop) {
			if (typeof (prop[name]) == "function" && typeof (proto[name]) == "function" && fnTest.test(prop[name])) {
				parent[name] = proto[name]; // save original function
				proto[name] = (function (name, fn) {
					return function () {
						var tmp = this.parent;
						this.parent = parent[name];
						var ret = fn.apply(this, arguments);
						this.parent = tmp;
						return ret;
					};
				})(name, prop[name]);
			} else {
				proto[name] = prop[name];
			}
		}
	};

	this.Class.extend = function (prop) {
		var parent = this.prototype;

		initializing = true;
		var prototype = new this();
		initializing = false;

		for (var name in prop) {
			if (typeof (prop[name]) == "function" && typeof (parent[name]) == "function" && fnTest.test(prop[name])) {
				prototype[name] = (function (name, fn) {
					return function () {
						var tmp = this.parent;
						this.parent = parent[name];
						var ret = fn.apply(this, arguments);
						this.parent = tmp;
						return ret;
					};
				})(name, prop[name]);
			} else {
				prototype[name] = prop[name];
			}
		}

		function Class() {
			if (!initializing) {

				// If this class has a staticInstantiate method, invoke it
				// and check if we got something back. If not, the normal
				// constructor (init) is called.
				if (this.staticInstantiate) {
					var obj = this.staticInstantiate.apply(this, arguments);
					if (obj) {
						return obj;
					}
				}

				for (var p in this) {
					if (typeof (this[p]) == 'object') {
						this[p] = copy(this[p]); // deep copy!
					}
				}

				if (this.init) {
					this.init.apply(this, arguments);
				}
			}

			return this;
		}

		Class.prototype = prototype;
		Class.constructor = Class;
		Class.extend = arguments.callee;
		Class.inject = inject;

		return Class;
	};

})();

newGuid_short = function () {
	var S4 = function () {
		return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
	};
	return (S4()).toString();
};

	
