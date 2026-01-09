var VueReactivity = (function (exports) {
  'use strict';

  const isObject = (value) => {
      return typeof value === "object" && value !== null;
  };
  const extend = Object.assign;

  // 实现 new Proxy(target, handler)
  // 是不是仅读的，仅读的属性 set 时候会报异常
  // 是不是深度的，
  function createGetter(isReadonly = false, shallow = false) {
      return function get(target, key, receiver) {
          // proxy + reflect
          const res = Reflect.get(target, key, receiver);
          if (shallow) {
              return res;
          }
          if (isObject(res)) {
              // vue2 是一上来就递归
              // Vue3 是当取值的时候才进行带来，vue3的代理模式是懒代理
              return isReadonly ? readonly(res) : reactive(res);
          }
          return res;
      };
  }
  const get = createGetter();
  const shallowGet = createGetter(false, true);
  const readonlyGet = createGetter(true, false);
  const shallowReadonlyGet = createGetter(true, true);
  function createSetter(shallow = false) {
      return function set(target, key, value, receiver) {
          const res = Reflect.set(target, key, value, receiver);
          return res;
      };
  }
  const set = createSetter();
  const shallowSet = createSetter(true);
  const mutableHanders = {
      get,
      set
  };
  const shallowReactiveHandlers = {
      get: shallowGet,
      set: shallowSet,
  };
  const readonlyObj = {
      set: (target, key) => {
          console.warn(`set on ky ${key} failed`);
      },
  };
  const readonlyHandlers = extend({
      get: readonlyGet,
  }, readonlyObj);
  const shallowReadonlyHandlers = extend({
      get: shallowReadonlyGet,
  }, readonlyObj);

  function reactive(target) {
      return createReactiveObject(target, false, mutableHanders);
  }
  function shallowReactive(target) {
      return createReactiveObject(target, false, shallowReactiveHandlers);
  }
  function readonly(target) {
      return createReactiveObject(target, true, readonlyHandlers);
  }
  function shallowReadonly(target) {
      return createReactiveObject(target, true, shallowReadonlyHandlers);
  }
  // 会垃圾回收，不会造成内存泄露， 存储的 key 只能是对象
  const reactiveMap = new WeakMap();
  const readonlyMap = new WeakMap();
  // 是不是深度，是不是仅读，做柯里化
  //new Proxy 最核心的需要拦截，数据的读取和数据的修改 get set
  function createReactiveObject(target, isReadonly, baseHandler) {
      // 如果目标不是对象，没法拦截了，reactive 这个 api 只能拦截对象类型
      if (!isObject(target)) {
          return;
      }
      // 如果某个对象已经被代理过了，就不要再代理了。可能一个对象，被代理是深度，又被仅读代理了
      const proxyMap = isReadonly ? readonlyMap : reactiveMap;
      let existMap = proxyMap.get(target);
      if (existMap) {
          // 如果已经被代理了，就直接返回即可
          return existMap;
      }
      const proxy = new Proxy(target, baseHandler);
      // 将要代理的对象和对应代理结果缓存起来
      proxyMap.set(target, proxy);
      return proxy;
  }

  exports.reactive = reactive;
  exports.readonly = readonly;
  exports.shallowReactive = shallowReactive;
  exports.shallowReadonly = shallowReadonly;

  return exports;

})({});
//# sourceMappingURL=reactivity.global.js.map
