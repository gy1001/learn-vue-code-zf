export function mountComponent(vm, el) {
  vm.$el = el;
  // 1. 调用 render 方法产生虚拟节点 虚拟 DOM
  vm._update(vm._render()); // vm.$options.render() 虚拟节点
  // 2. 根据虚拟 DOM 产生真是 DOM
  // 3. 插入到 el 元素中
}

export function initLifeCycle(Vue) {
  Vue.prototype._update = function () {
    console.log("_update");
  };

  Vue.prototype._render = function () {
    console.log("_render");
  };
}
