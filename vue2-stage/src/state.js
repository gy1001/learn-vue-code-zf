export function initState(vm) {
  const opts = vm.$options;

  if (opts.data) {
    initData(vm);
  }
}

function initData(vm) {
  let data = vm.$options.data; // data 可能是函数和对象

  data = typeof data === "function" ? data.call(this) : data;
}
