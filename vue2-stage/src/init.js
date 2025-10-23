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
    el = document.querySelector(el)
    const ops = vm.$options
    if (!ops.render) {
      let template
      // 先进行查找是否有 render 函数，
      // 没有 render 函数看一下是否写了 template 没有写 template 就用外部的 template
      if (!ops.template && el) {
        // 没有写模板，但是写了 el
        template = el.outerHTML
      } else {
        if (el) {
          template = ops.template
        }
      }
      // console.log(template);
      if (template) {
        // 这里需要对模板进行编译
        ops.render = compileToFunction(template) // jsx 最终也会被被编译成 h('xxx')
      }
    }
    // 最终可以获取到 render 方法
    // console.log(ops.render);
    mountComponent(vm, el) // 组件的挂载
  }
}

// script 标签使用的是 vue.global.js 这个编译过程是在浏览器中进行的
// runtime 是不包含模板编译的，整个编译打包的过程是通过 loader 来转义 .vue 文件的，
// 用runtime时候不能使用 template
