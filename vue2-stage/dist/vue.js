(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _classCallCheck(a, n) {
    if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
  }
  function _defineProperties(e, r) {
    for (var t = 0; t < r.length; t++) {
      var o = r[t];
      o.enumerable = o.enumerable || false, o.configurable = true, "value" in o && (o.writable = true), Object.defineProperty(e, _toPropertyKey(o.key), o);
    }
  }
  function _createClass(e, r, t) {
    return r && _defineProperties(e.prototype, r), Object.defineProperty(e, "prototype", {
      writable: false
    }), e;
  }
  function _toPrimitive(t, r) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r);
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (String )(t);
  }
  function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _typeof(o) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
      return typeof o;
    } : function (o) {
      return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
    }, _typeof(o);
  }

  // 我们重写数组中的部分方法

  var originArrayProto = Array.prototype; // 获取数组中的原型

  // newArrayProto.__proto__ = originArrayProto
  var newArrayProto = Object.create(originArrayProto);

  // 找到所有的变异方法：会改变原数组
  var arrayMethods = ["push", "pop", "shift", "unshift", "splice", "sort", "reverse"];
  arrayMethods.forEach(function (method) {
    // 这里重写数组的方法
    newArrayProto[method] = function () {
      var _originArrayProto$met;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      // 内部调用原来的方法，函数的劫持，切片编程
      var result = (_originArrayProto$met = originArrayProto[method]).call.apply(_originArrayProto$met, [this].concat(args));
      console.log("方法被调用了, method: ", method);
      // 我们需要对新增的数据再次进行劫持
      var inserted;
      switch (method) {
        case "push":
        case "unshift":
          inserted = args;
          break;
        case "splice":
          inserted = args.slice(2);
          break;
      }
      // 对插入的数据进行劫持
      observe(inserted);
      return result;
    };
  });

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);
      // Object.defineProperty 只能劫持已经存在的属性，新增、删除的都无法
      // vue2中为此还专门写了一个api: $set $delete
      // data.__ob__ = this; // 这里直接赋值会导致死循环，一直加__ob__
      Object.defineProperty(data, "__ob__", {
        value: this,
        configurable: false // 将 __ob__ 变为不可枚举
      });
      if (Array.isArray(data)) {
        // 我们可以重写数组中的方法: 7个变异方法，它们可以修改原数组

        data.__proto__ = newArrayProto; // 这里需要保留数组原有弹性，并且可以重写部分方法
        // 数组中还有引用类型属性的数据：
        this.observeArray(data);
      } else {
        this.walk(data);
      }
    }
    return _createClass(Observer, [{
      key: "observeArray",
      value: function observeArray(data) {
        data.forEach(function (item) {
          observe(item);
        });
      }
    }, {
      key: "walk",
      value: function walk(data) {
        // 循环data对象，对属性依次进行劫持

        // “重新定义”属性：性能就有减弱了
        Object.keys(data).forEach(function (key) {
          return defineReactive(data, key, data[key]);
        });
      }
    }]);
  }(); // 属性劫持
  function defineReactive(target, key, value) {
    // 如果还是对象，就需要再次进行劫持
    observe(value);
    // 这里使用了闭包
    Object.defineProperty(target, key, {
      configurable: true,
      get: function get() {
        console.log("用户取值了,key: ", key);
        // 取值的时候,会执行 get
        return value;
      },
      set: function set(newValue) {
        console.log("用户设置值了,key: ", key);
        // 修改的时候，会执行 set
        if (newValue !== value) {
          // 如果设置的是对象，也要进行劫持响应化处理
          observe(newValue);
          value = newValue;
        }
      }
    });
  }
  function observe(data) {
    // 对这个对象进行劫持
    if (_typeof(data) !== "object" || data == null) {
      return; // 只对对象进行劫持
    }
    // 如果一个对象被劫持过了，那就不需要在被劫持了
    // 要判断一个对象是否被劫持过，可以增加一个实例，用实例来判断是否被劫持过
    if (data.__ob__ instanceof Observer) {
      return data.__ob__;
    }
    return new Observer(data);
  }

  function initState(vm) {
    var opts = vm.$options;
    if (opts.data) {
      initData(vm);
    }
  }
  function initData(vm) {
    var data = vm.$options.data; // data 可能是函数和对象

    data = typeof data === "function" ? data.call(this) : data;
    vm._data = data;
    // 对数据进行接触，vue2中采用了一个api： defineProperty
    observe(data);

    // 将 vm._data 用 vm 来代理就可以了
    for (var key in data) {
      proxy(vm, "_data", key);
    }
  }
  function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[target][key];
      },
      set: function set(val) {
        vm[target][key] = val;
      }
    });
  }

  function initMixin(Vue) {
    // 就是给 vue 增加 init 方法的
    Vue.prototype._init = function (options) {
      // 用户初始化操作
      // vue vm.$options 就是获取用户的配置项

      var vm = this;
      vm.$options = options; // 将用户的选项挂在在实例上

      // 初始化状态
      initState(vm);
    };
  }

  function Vue(options) {
    // options 就是用户的选项
    this._init(options);
  }
  initMixin(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
