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
      console.log(this, "arrayMethods--------------");
      var ob = this.__ob__;
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
      if (inserted) {
        ob.observeArray(inserted);
      }

      // 走到这里进行通知更新
      ob.dep.notify(); // 数组变化了通知对应的 watcher 进行更新
      return result;
    };
  });

  var uid = 0;
  var Dep = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);
      this.id = uid++; // 属性的 dep 要收集 watcher
      this.subs = []; // 这里面存放着当前属性对应的 watcher
    }
    return _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        // 这里我们不需要放置重复的 watcher，而且这里还只是一个单向的关系：dep->watcher
        // 其实 还需要双向：watcher -> dep: 比如组件卸载时候，需要删除对应的渲染函数
        // 这里本来可以直接塞入，但是为了双向记录并且去重，所以不能简单的 push，需要绕一圈
        // this.subs.push(Dep.target); ----> 简单这样写，不能去重
        if (Dep.target) {
          Dep.target.addDep(this); // 让 watcher 记住 dep
        }
      }
    }, {
      key: "addSub",
      value: function addSub(watcher) {
        this.subs.push(watcher);
      }
    }, {
      key: "notify",
      value: function notify() {
        this.subs.forEach(function (watcher) {
          watcher.update();
        });
      }
    }]);
  }();
  Dep.target = null;
  var stack = [];
  function pushTarget(watcher) {
    stack.push(watcher);
    Dep.target = watcher;
  }
  function popTarget(watcher) {
    stack.pop();
    Dep.target = stack[stack.length - 1];
  }

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);
      // 给每个对象都增加收集功能
      this.dep = new Dep();

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
  }(); // 深层次嵌套会递归，递归多了性能差，不存在的属性监控不到，存在的属性又重写方法
  // vue3 采用了 proxy，省略了这些过程
  function dependArray(arr) {
    for (var i = 0; i < arr.length; i++) {
      var current = arr[i];
      // 如果 current 是一个数组中的字符串，就没有__ob__
      if (current.__ob__) {
        current.__ob__.dep.depend();
      }
      if (Array.isArray(current)) {
        dependArray(current);
      }
    }
  }

  // 属性劫持
  function defineReactive(target, key, value) {
    // 如果还是对象，就需要再次进行劫持
    var childOb = observe(value); // childOb上就有 dep 属性，用来收集依赖
    // 这里使用了闭包
    var dep = new Dep(); // 每一个属性都有一个 dep
    Object.defineProperty(target, key, {
      configurable: true,
      get: function get() {
        console.log("用户取值了,key: ", key, value);
        // 取值的时候,会执行 get
        dep.depend();
        if (childOb) {
          childOb.dep.depend(); // 让数组和对象本身也实现依赖收集，以前针对的是属性，现在增加对象本身
          // 这里还要做判断，如果当前值是数组
          if (Array.isArray(value)) {
            dependArray(value);
          }
        }
        return value;
      },
      set: function set(newValue) {
        console.log("用户设置值了,key: ", key, newValue);
        // 修改的时候，会执行 set
        if (newValue !== value) {
          // 如果设置的是对象，也要进行劫持响应化处理
          observe(newValue);
          value = newValue;
          // 通知相关依赖更新
          dep.notify();
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

  var id = 0;

  // 1. 当我们创建渲染 watcher 的时候我们会把当前的渲染 watcher 放到 Dep.target上
  // 2. 调用 _render() 会取值，就会走到 get 上

  // 每个属性有一个 dep（属性就是被观察者），watcher 就是观察者（属性更新了通知观察者来更新）=> 观察者模式

  var Watcher = /*#__PURE__*/function () {
    // 不同组件有不同的 watcher，目前只有一个渲染根实例的
    function Watcher(vm, fn, options) {
      _classCallCheck(this, Watcher);
      this.id = id++;
      this.renderWatcher = options; // 是否是一个渲染 watcher
      this.getter = fn; // getter 意味着调用这个函数可以发生取值操作
      this.lazy = options.lazy; // 是否懒惰
      this.dirty = this.lazy;
      this.depsIdSet = new Set();
      this.vm = vm;
      this.deps = []; //用于记录对应的 dep，后续我们实现计算属性和一些清理工作需要用到
      // 初始化时候调用一次，保证 vm 上的属性取值触发

      if (this.lazy) ; else {
        this.get();
      }
    }
    return _createClass(Watcher, [{
      key: "evaluate",
      value: function evaluate() {
        this.value = this.get(); // 获取到用户函数的返回值
        this.dirty = false; // 并且还要标识为脏
      }
    }, {
      key: "get",
      value: function get() {
        // Dep.target = this;
        // this.getter(); // 这里会在 vm 上取值
        // Dep.target = null; // 渲染完毕后就清空
        // -------------
        // 这里改为：维护为一个队列，

        pushTarget(this);
        var value = this.getter.call(this.vm);
        popTarget();
        return value;
      }
    }, {
      key: "addDep",
      value: function addDep(dep) {
        // 一个组件对应着多个属性，重复的属性也不用记录
        var depId = dep.id;
        if (!this.depsIdSet.has(depId)) {
          this.deps.push(dep);
          this.depsIdSet.add(depId);
          // watcher 已经记住了 dep 了而且已经去重了，此时让 dep 也记住 watcher
          dep.addSub(this);
        }
      }
    }, {
      key: "update",
      value: function update() {
        // this.get(); // 重新更新渲染
        // 下面开始做异步更新操作，那么就不能立即执行，我们用一个队列把函数暂存起啦
        queueWatcher(this); // 把当前的 watcher 进行暂存
      }
    }, {
      key: "run",
      value: function run() {
        this.get();
      }
    }]);
  }();
  var queue = [];
  var has = {};
  var pending = false; // 防抖
  function queueWatcher(watcher) {
    var watcherId = watcher.id;
    if (!has[watcherId]) {
      // 如果当前队列中没有当前 watcherId 就存入
      queue.push(watcher);
      has[watcherId] = true;
      // 不管我们的 update 执行多少次，但是最终只执行一次刷新操作
      if (!pending) {
        nextTick(flushSchedulerQueue);
        pending = true;
      }
    }
  }
  function flushSchedulerQueue() {
    console.log('这里执行重新渲染操作------------------');
    var newQueue = queue.slice();
    queue.length = 0;
    queue = [];
    has = {};
    pending = false;
    for (var i = 0; i < newQueue.length; i++) {
      newQueue[i].run(); // 在刷新的国策还给你中可能还有还有新的 watcher，重新翻到 queue 中
    }
  }
  var callbacks = [];
  var waiting = false;
  function flushCallbacks() {
    var cbs = callbacks.slice();
    waiting = false;
    callbacks = [];
    cbs.forEach(function (callback) {
      return callback();
    }); // 按照顺序执行
  }

  // nextTick 中没有直接使用某个 api，而是采用了优雅降级的方式
  // 内部先采用的是 promise（IE 不兼容）
  // 然后采用 MutationObserver（h5的 api）
  // 然后在考虑 IE 专享 setIMediate
  // 然后再使用 setTimeout

  var _timerFunction;
  if (Promise) {
    _timerFunction = function timerFunction() {
      Promise.resolve().then(flushCallbacks);
    };
  } else if (MutationObserver) {
    _timerFunction = function timerFunction() {
      var observer = new MutationObserver(flushCallbacks);
      // 这里传入的回调是异步执行的
      var textNode = document.createTextNode(1);
      observer.observe(textNode, {
        characterData: true
      });
      _timerFunction = function timerFunction() {
        textNode.textContent = 2;
      };
    };
  } else if (setImmediate) {
    _timerFunction = function _timerFunction() {
      setImmediate(flushCallbacks);
    };
  } else {
    _timerFunction = function _timerFunction() {
      setTimeout(flushCallbacks);
    };
  }
  function nextTick(cb) {
    callbacks.push(cb); // 维护 nextTick中的 callback
    if (!waiting) {
      _timerFunction();
      // vue3已经不兼容 ie 直接使用 promise
      // Promise.resolve().then(flushCallbacks); // vue3的写法
      waiting = true;
    }
  }

  // 需要给可以个属性增加一个 dep，目的就是收集 watcher
  // 一个组价视图中有多个属性（n 个属性会对应一个视图)）,n 个 dep 对应一个 watcher
  // 1 个属性对应多个视图, 1个 dep 对应多个 watcher
  // 多对多的关系

  function initState(vm) {
    var opts = vm.$options;
    if (opts.data) {
      initData(vm);
    }
    if (opts.computed) {
      initComputed(vm);
    }
  }
  function initComputed(vm) {
    var computed = vm.$options.computed;
    var watchers = vm._computedWatchers = {}; // 将计算属性 watchers 保存到 vm 上
    for (var key in computed) {
      var computedValue = computed[key];

      // 我们需要监控，计算属性中 get 的变化
      var fn = typeof computedValue === 'function' ? computedValue : computedValue.get;
      // 如果直接 watcher 就会默认执行 fn
      // 将属性和 watcher 对应起来
      watchers[key] = new Watcher(vm, fn, {
        lazy: true // 懒惰 watcher
      });
      defineComputed(vm, key, computedValue);
    }
  }
  function defineComputed(target, key, computedValue) {
    // 有可能是对象，有可能是函数
    typeof computedValue === 'function' ? computedValue : computedValue.get;
    var setter = computedValue.set || function () {};

    // 可以通过实例拿到对应的属性
    Object.defineProperty(target, key, {
      get: createComputedGetter(key),
      set: setter
    });
  }

  // 我们需要检测是否要执行这个 getter
  function createComputedGetter(key) {
    return function () {
      var watcher = this._computedWatchers[key]; // 获取到对应属性的 watcher
      if (watcher.dirty) {
        // 如果是脏的，就去执行用户传入的函数
        watcher.evaluate(); // 求值后，dirty 变为了 false，下次就不会在求值了
      }
      return watcher.value;
    };
  }
  function initData(vm) {
    var data = vm.$options.data; // data 可能是函数和对象

    data = typeof data === 'function' ? data.call(this) : data;
    vm._data = data;
    // 对数据进行接触，vue2中采用了一个api： defineProperty
    observe(data);

    // 将 vm._data 用 vm 来代理就可以了
    for (var key in data) {
      proxy(vm, '_data', key);
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

  // attribute 匹配属性
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
      str += "".concat(attr.name, ": ").concat(JSON.stringify(attr.value), ",");
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
    var code = "_c('".concat(ast.tag, "', ").concat(ast.attrs.length > 0 ? genProps(ast.attrs) : "null", ", ").concat(ast.children.length ? "".concat(children) : "", ")");
    return code;
  }
  function compileToFunction(template) {
    // 1. 将 template 转换成 ast语法树木
    var ast = parseHtml(template);
    // 2. 生成 render 方法，render方法的返回结果是虚拟DOM
    var code = codegen(ast);
    // 模板引擎的实现原理就是：with + new Function
    code = "with(this){return ".concat(code, "}");
    return new Function(code); // 根据代码生成 render 函数
  }

  // 这个样子和ast一样吗？
  // ast 做的是语法层面的转换，它描述的是语法本身（可以描述 js css html）
  // 这里我们的虚拟 DOM 是描述的 DOM 元素，可以增加一些自定义属性(描述 dom 元素)
  function vNode(vm, tag, key, data, children, text) {
    return {
      tag: tag,
      data: data,
      children: children,
      text: text,
      key: key
    };
  }

  // h() _c()
  function createElementVNode(vm, tag) {
    var props = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }
    console.log("children", children);
    var key = props === null || props === void 0 ? void 0 : props.key;
    props === null || props === void 0 || delete props.key;
    return vNode(vm, tag, key, props, children);
  }

  // _v()
  function createTextVNode(vm, text) {
    return vNode(vm, undefined, undefined, undefined, undefined, text);
  }

  function mountComponent(vm, el) {
    vm.$el = el;
    // 1. 调用 render 方法产生虚拟节点 虚拟 DOM
    // vm._update(vm._render()); // vm.$options.render() 虚拟节点

    var updateComponent = function updateComponent() {
      vm._update(vm._render());
    };
    new Watcher(vm, updateComponent, true); // true 用于标识这是一个渲染 watcher

    // 2. 根据虚拟 DOM 产生真是 DOM
    // 3. 插入到 el 元素中
  }
  function initLifeCycle(Vue) {
    Vue.prototype._c = function () {
      console.log('调用了 _c');
      return createElementVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };
    Vue.prototype._v = function () {
      console.log('调用了 _v');
      return createTextVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };
    Vue.prototype._s = function (value) {
      console.log('调用了 _s');
      if (_typeof(value) !== 'object') {
        return value;
      }
      return JSON.stringify(value);
    };
    Vue.prototype._update = function (vNode) {
      console.log('_update');
      var vm = this;
      var el = vm.$el;
      // patch 既有初始化的功能，又有更新的公共功能
      // 创建或者更新完毕后，返回的节点赋值给实例上，更新实例上的节点
      vm.$el = patch(el, vNode);
    };
    Vue.prototype._render = function () {
      console.log('_render');
      var vm = this;
      return vm.$options.render.call(vm); // 通过 ast 语法转义后生成的 render 方法
    };
  }
  function patchProps(el, props) {
    for (var key in props) {
      if (key === 'style') {
        for (var styleName in props.style) {
          el.style[styleName] = props.style[styleName];
        }
      } else {
        el.setAttribute(key, props[key]);
      }
    }
  }
  function createElm(vNode) {
    var tag = vNode.tag,
      _vNode$children = vNode.children,
      children = _vNode$children === void 0 ? [] : _vNode$children,
      data = vNode.data,
      text = vNode.text;
    if (typeof tag === 'string') {
      // 这里将真实节点和虚拟节点对应起来，后续如果修改属性了
      vNode.el = document.createElement(tag);

      // 更新属性
      patchProps(vNode.el, data);
      children.forEach(function (child) {
        var childElm = createElm(child);
        vNode.el.appendChild(childElm);
      });
    } else {
      vNode.el = document.createTextNode(text);
    }
    return vNode.el;
  }
  function patch(oldVNode, vNode) {
    // 写的是初渲染流程
    var isRealElement = oldVNode.nodeType;
    if (isRealElement) {
      console.log('这里进行渲染了');
      var elm = oldVNode; // 获取真实元素
      var parentElm = elm.parentNode; // 获取父元素
      var newElm = createElm(vNode);
      parentElm.insertBefore(newElm, elm.nextSibling);
      // 移除老节点
      parentElm.removeChild(elm);
      return newElm;
    } else {
      console.log('TODO diff 算法');
    }
  }
  function callHook(vm, hook) {
    var handlers = vm.$options[hook];
    if (handlers) {
      handlers.forEach(function (handler) {
        handler.call(vm);
      });
    }
  }

  var strats = {};
  var LIFE_CYCLE = ['beforeCreate', 'created', 'beforeMount'];
  LIFE_CYCLE.forEach(function (cycle) {
    // {} {created: function(){} } => {created: [fn]}
    // {created: [fn]} {created: function(){}} => {created: [fn, fn]}
    strats[cycle] = function (p, c) {
      if (c) {
        // 如果儿子有，并且父亲有，让父亲和儿子拼在一起
        if (p) {
          return p.concat(c);
        } else {
          // 对于第一次，只有儿子有，父亲没有, 则将儿子包装成对象
          return [c];
        }
      } else {
        // 如果儿子没有，则用父亲即可
        return p;
      }
    };
  });
  function mergeOptions(parent, child) {
    console.log(parent, child, 'parent, child');
    function mergeField(key) {
      // 为了避免多次 if，可以采用策略模式
      if (strats[key]) {
        options[key] = strats[key](parent[key], child[key]);
      } else {
        // 如果不在策略中
        // 优先采用 child 的，再采用 parent 的
        options[key] = child[key] || parent[key];
      }
    }
    var options = {};
    for (var key in parent) {
      mergeField(key);
    }
    for (var _key in child) {
      // 在这里只合并child 中不存在于 parent 的属性
      if (!parent.hasOwnProperty(_key)) {
        mergeField(_key);
      }
    }
    return options;
  }

  function initMixin(Vue) {
    // 就是给 vue 增加 init 方法的
    Vue.prototype._init = function (options) {
      // 用户初始化操作
      // vue vm.$options 就是获取用户的配置项

      var vm = this;

      // 我们定义的全局指令和过滤器等等等，都会挂在实例上
      vm.$options = mergeOptions(this.constructor.options, options); // 将用户的选项挂在在实例上
      console.log(vm.$options, 'vm.$options');

      // 初始化之前， 调用 hooks 上的 beforeCreate
      callHook(vm, 'beforeCreate');

      // 初始化状态
      initState(vm);

      // 初始化之后， 调用 hooks 上的 created
      callHook(vm, 'created');
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
      // console.log(ops.render);
      mountComponent(vm, el); // 组件的挂载
    };
  }

  // script 标签使用的是 vue.global.js 这个编译过程是在浏览器中进行的
  // runtime 是不包含模板编译的，整个编译打包的过程是通过 loader 来转义 .vue 文件的，
  // 用runtime时候不能使用 template

  function initGlobalApi(Vue) {
    // 静态方法
    Vue.options = {};
    Vue.mixin = function (mixin) {
      // 我们期望将用户的选项和全局的 options 进行合并
      this.options = mergeOptions(this.options, mixin);
      return this;
    };
  }

  function Vue(options) {
    // options 就是用户的选项
    this._init(options);
  }
  Vue.prototype.$nextTick = nextTick;
  initMixin(Vue);
  initLifeCycle(Vue);
  initGlobalApi(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
