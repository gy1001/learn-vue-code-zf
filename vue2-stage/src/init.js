import { initState } from "./state";

export function initMixin(Vue) {
  // 就是给 vue 增加 init 方法的
  Vue.prototype._init = function (options) {
    // 用户初始化操作
    // vue vm.$options 就是获取用户的配置项

    const vm = this;

    vm.$options = options; // 将用户的选项挂在在实例上

    // 初始化状态
    initState(vm);
  };
}
