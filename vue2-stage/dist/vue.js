(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Vue = {}));
})(this, (function (exports) { 'use strict';

	var a = 100;
	var b = 200;
	var index = {
	  Vue: 1
	};

	exports.a = a;
	exports.b = b;
	exports.default = index;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=vue.js.map
