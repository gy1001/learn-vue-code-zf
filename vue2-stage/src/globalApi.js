import { mergeOptions } from './utils'

export function initGlobalApi(Vue) {
  // 静态方法
  Vue.options = {
    _base: Vue,
  }

  Vue.mixin = function (mixin) {
    // 我们期望将用户的选项和全局的 options 进行合并
    this.options = mergeOptions(this.options, mixin)
    return this
  }

  // 可以手动创造组件进行挂载
  Vue.extend = function (options) {
    // 就是实现根据用户的参数，返回一个构造函数而已
    function Sub(opts = {}) {
      this._init(opts) // 默认对子类进行初始化操作
    }
    Sub.prototype = Object.create(Vue.prototype) // Sub.prototype.__proto__ = Vue.prototype
    Sub.prototype.constructor = Sub
    Sub.options = mergeOptions(Vue.options, options) // 保存用户传递的选项
    // 最终使用一个组件，即使 new 一个实例
    return Sub
  }

  Vue.options.components = {}
  Vue.component = function (name, definition) {
    // 如果definition已经是一个函数的，说明用户自己调用了 Vue.extend
    definition =
      typeof definition === 'function' ? definition : Vue.extend(definition)
    Vue.options.components[name] = definition
  }
}
