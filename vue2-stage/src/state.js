import { observe } from "./observe/index";

export function initState(vm) {
  const opts = vm.$options;

  if (opts.data) {
    initData(vm);
  }
}

function initData(vm) {
  let data = vm.$options.data; // data 可能是函数和对象

  data = typeof data === "function" ? data.call(this) : data;

  vm._data = data;
  // 对数据进行接触，vue2中采用了一个api： defineProperty
  observe(data);

  // 将 vm._data 用 vm 来代理就可以了
  for (const key in data) {
    proxy(vm, "_data", key);
  }
}

function proxy(vm, target, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[target][key];
    },
    set(val) {
      vm[target][key] = val;
    },
  });
}
