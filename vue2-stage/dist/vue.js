(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _arrayLikeToArray(r, a) {
    (null == a || a > r.length) && (a = r.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
    return n;
  }
  function _arrayWithHoles(r) {
    if (Array.isArray(r)) return r;
  }
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
  function _iterableToArrayLimit(r, l) {
    var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (null != t) {
      var e,
        n,
        i,
        u,
        a = [],
        f = true,
        o = false;
      try {
        if (i = (t = t.call(r)).next, 0 === l) ; else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
      } catch (r) {
        o = true, n = r;
      } finally {
        try {
          if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a;
    }
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _slicedToArray(r, e) {
    return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
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
  function _unsupportedIterableToArray(r, a) {
    if (r) {
      if ("string" == typeof r) return _arrayLikeToArray(r, a);
      var t = {}.toString.call(r).slice(8, -1);
      return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
    }
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

  var unicodeRegExp = /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/;
  // unicodeRegExp.source 用于拿到正则表达式 unicodeRegExp 的字符串。

  // 第一个分组就是属性的key value就是分组3分组4分组5
  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z".concat(unicodeRegExp.source, "]*");
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");

  //他匹配到的分组是一个标签名 </xxx 最终匹配到的分组是开始标签名
  var startTagOpen = new RegExp("^<".concat(qnameCapture));
  var startTagClose = /^\s*(\/?)>/;

  // 匹配到的是 </xxx 最终匹配到的分组是结束标签名
  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>"));
  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
  var ELEMENT_TYPE = 1;
  var TEXT_TYPE = 3;
  function parseHtml(html) {
    var stack = []; // 用于存放元素的
    var currentParent; // 指向的是栈中的最后一个
    var root; // 根节点

    // 最终需要转换成一颗抽象语法树

    function createAstElement(tag, attrs) {
      return {
        tag: tag,
        type: ELEMENT_TYPE,
        attrs: attrs,
        children: [],
        parent: null
      };
    }
    function start(tag, attrs) {
      // 创造一个AST 节点
      var node = createAstElement(tag, attrs);
      if (!root) {
        // 看一下是否是空树，如果为空则当前是树的根节点
        root = node;
      }
      // 如果当前父节点有值
      if (currentParent) {
        node.parent = currentParent;
        currentParent.children.push(node);
      }
      stack.push(node);
      // currentParent 为栈中的最后一个
      currentParent = node;
    }
    function end(tag) {
      var node = stack.pop(); // 弹出最后一个， 校验标签是否合法
      if (node.tag !== tag) {
        console.log(tag, node);
        console.error("标签开始和结束不一致");
      }
      currentParent = stack[stack.length - 1];
    }
    function chars(text) {
      text = text.replace(/\s/g, ""); // 删除空格
      if (text) {
        // 把文本直接放到当前指向的节点中
        currentParent.children.push({
          type: TEXT_TYPE,
          text: text,
          parent: currentParent
        });
      }
    }
    function advance(n) {
      html = html.substring(n); // 返回该字符串从起始索引到结束索引（不包括）的部分
    }
    function parseStartTag() {
      var start = html.match(startTagOpen);
      if (start) {
        var match = {
          tagName: start[1],
          attrs: []
        };
        advance(start[0].length);
        // 如果不是开始标签的结束，就一直匹配下去
        var attr, _end;
        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          advance(attr[0].length);
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5] || true
          });
        }
        if (_end) {
          advance(_end[0].length); //
        }
        return match;
      }
      // 不是开始标签
      return false;
    }

    // html 最开始肯定是一个 <
    while (html) {
      var textEnd = html.indexOf("<"); // 如果 indexOf 中的索引是0，则说明是个标签
      // 如果 textEnd 为0，则说明是一个开始标签，或者结束标签
      // 如果 textEnd >0 说明是文本开始的位置
      if (textEnd === 0) {
        var startTagMatch = parseStartTag();
        if (startTagMatch) {
          // 解析到了开始标签
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        }
        var endTagMatch = html.match(endTag);
        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[1]);
          continue;
        }
      }
      if (textEnd > 0) {
        // 说明有文本
        var text = html.substring(0, textEnd); // 截取出来文本内容
        if (text) {
          advance(text.length); // 解析到了文本
          chars(text);
        }
      }
    }
    return root;
  }

  function genProps(attrs) {
    var str = ""; // {name, value}
    var _loop = function _loop() {
      var attr = attrs[i];
      if (attr.name === "style") {
        // color: 'red' => {color: 'red'}
        var obj = {};
        attr.value.split(";").forEach(function (item) {
          var _item$split = item.split(":"),
            _item$split2 = _slicedToArray(_item$split, 2),
            key = _item$split2[0],
            value = _item$split2[1];
          obj[key] = value.trim();
        });
        attr.value = obj;
      }
      str += "".concat(attr.name, ": ").concat(JSON.stringify(attr.value), "',");
    };
    for (var i = 0, len = attrs.length; i < len; i++) {
      _loop();
    }
    return "{".concat(str.slice(0, -1), "}"); // 去掉最后一个，
  }
  function genChild(node) {
    // 如果是文本、元素
    if (node.type === ELEMENT_TYPE) {
      // 是元素
      return codegen(node);
    } else if (node.type === TEXT_TYPE) {
      // 是文本
      var nodeText = node.text;
      if (!defaultTagRE.test(nodeText)) {
        // 是不是一个文本
        return "_v(".concat(JSON.stringify(nodeText), ")");
      }
      // {{name}} hello {{age}}
      // 需要转变为
      // _v( _s(name) + "hello" + _s(age))
      // _c是创建元素的，_v是创建文本的，_s是 JSON.stringify
      var tokens = [];
      var match;
      defaultTagRE.lastIndex = 0;
      var lastIndex = 0;
      while (match = defaultTagRE.exec(nodeText)) {
        var index = match.index; // 匹配的位置
        if (index > lastIndex) {
          tokens.push(JSON.stringify(nodeText.slice(lastIndex, index)));
        }
        tokens.push("_s(".concat(match[1].trim(), ")"));
        lastIndex = index + match[0].length;
      }
      // 如果匹配完，后面还有文本
      if (lastIndex < nodeText.length) {
        tokens.push(JSON.stringify(nodeText.slice(lastIndex, nodeText.length)));
      }
      return "_v(".concat(tokens.join("+"), ")");
    }
  }
  function genChildren(children) {
    return children.map(function (child) {
      return genChild(child);
    }).join(",");
  }
  function codegen(ast) {
    var children = genChildren(ast.children);
    var code = "_c('".concat(ast.tag, "', ").concat(ast.attrs.length > 0 ? genProps(ast.attrs) : "null", " ").concat(ast.children.length ? ",".concat(children) : "", "})");
    return code;
  }
  function compileToFunction(template) {
    // 1. 将 template 转换成 ast语法树木
    var ast = parseHtml(template);
    // 2. 生成 render 方法，render方法的返回结果是虚拟DOM
    console.log(codegen(ast));
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

      //
      if (options.el) {
        vm.$mount(options.el); // 实现数据的挂在
      }
    };

    // 挂载
    Vue.prototype.$mount = function (el) {
      var vm = this;
      el = document.querySelector(el);
      var ops = vm.$options;
      if (!ops.render) {
        var template;
        // 先进行查找是否有 render 函数，
        // 没有 render 函数看一下是否写了 template 没有写 template 就用外部的 template
        if (!ops.template && el) {
          // 没有写模板，但是写了 el
          template = el.outerHTML;
        } else {
          if (el) {
            template = ops.template;
          }
        }
        // console.log(template);
        if (template) {
          // 这里需要对模板进行编译
          ops.render = compileToFunction(template); // jsx 最终也会被被编译成 h('xxx')
        }
      }
      // 最终可以获取到 render 方法
      console.log(ops.render);
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
