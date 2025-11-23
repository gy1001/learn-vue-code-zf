import { initState } from './state'
import { compileToFunction } from './compiler/index'
import { callHook, mountComponent } from './lifecycle'
import { mergeOptions } from './utils'

export function initMixin(Vue) {
  // 就是给 vue 增加 init 方法的
  Vue.prototype._init = function (options) {
    // 用户初始化操作
    // vue vm.$options 就是获取用户的配置项

    const vm = this

    // 我们定义的全局指令和过滤器等等等，都会挂在实例上
    vm.$options = mergeOptions(this.constructor.options, options) // 将用户的选项挂在在实例上
    console.log(vm.$options, 'vm.$options')

    // 初始化之前， 调用 hooks 上的 beforeCreate
    callHook(vm, 'beforeCreate')

    // 初始化状态
    initState(vm)

    // 初始化之后， 调用 hooks 上的 created
    callHook(vm, 'created')

    if (options.el) {
      vm.$mount(options.el) // 实现数据的挂在
    }
  }

  // 挂载
  Vue.prototype.$mount = function (el) {
    const vm = this
    // 1. 处理 el：支持传入选择器字符串或 DOM 元素，最终转为 DOM 元素
    el = el && document.querySelector(el)
    const ops = vm.$options
    // 2. 模板优先级：render > template > el.innerHTML（核心修复点）
    if (!ops.render) {
      // 优先判断是否有 render 函数（最高优先级）
      let template = ops.template // 先读取用户配置的 template 选项
      if (template) {
        // 若有 template 选项，直接用（支持字符串模板）
      } else if (el) {
        // 若无 template，fallback 到 el 的 innerHTML 作为模板（而非 outerHTML）
        template = el.innerHTML
      }
      // 3. 若有模板（无论是用户配置的还是 el 内部的），编译为 render 函数
      if (template) {
        ops.render = compileToFunction(template)
      }
    }

    // 4. 执行组件挂载（核心逻辑，不变）
    mountComponent(vm, el)
    return this // 链式调用支持

    // script 标签使用的 vue.global.js 这个编译过程是在浏览器中运行的
    // runtime 是不包含模板编译的，整个编译过程是打包的过程中和通过 loader 来转译 .vue 文件，用runtime 的时候不能使用 template 属性

    // 最终就可以获取 render 函数
  }
}

// script 标签使用的是 vue.global.js 这个编译过程是在浏览器中进行的
// runtime 是不包含模板编译的，整个编译打包的过程是通过 loader 来转义 .vue 文件的，
// 用runtime时候不能使用 template
