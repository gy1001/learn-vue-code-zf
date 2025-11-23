import { createElementVNode, createTextVNode } from './vdom/index'
import { Watcher } from './observe/watcher'
import { patch } from './vdom/patch'

export function mountComponent(vm, el) {
  vm.$el = el
  // 1. 调用 render 方法产生虚拟节点 虚拟 DOM
  // vm._update(vm._render()); // vm.$options.render() 虚拟节点

  const updateComponent = () => {
    vm._update(vm._render())
  }
  new Watcher(vm, updateComponent, true) // true 用于标识这是一个渲染 watcher

  // 2. 根据虚拟 DOM 产生真是 DOM
  // 3. 插入到 el 元素中
}

export function initLifeCycle(Vue) {
  Vue.prototype._c = function () {
    console.log('调用了 _c')
    return createElementVNode(this, ...arguments)
  }

  Vue.prototype._v = function () {
    console.log('调用了 _v')
    return createTextVNode(this, ...arguments)
  }

  Vue.prototype._s = function (value) {
    console.log('调用了 _s')
    if (typeof value !== 'object') {
      return value
    }
    return JSON.stringify(value)
  }

  Vue.prototype._update = function (vNode) {
    console.log('_update')
    const vm = this
    const el = vm.$el
    // patch 既有初始化的功能，又有更新的公共功能
    // 创建或者更新完毕后，返回的节点赋值给实例上，更新实例上的节点
    // vm.$el = patch(el, vNode)

    //--------更改如下
    const prevVNode = vm._vnode
    vm._vnode = vNode // 把组件第一次产生的虚拟节点保存到 _vnode 上
    if (prevVNode) {
      // 说明之前渲染过了
      vm.$el = patch(prevVNode, vNode)
    } else {
      vm.$el = patch(el, vNode)
    }
  }

  Vue.prototype._render = function () {
    console.log('_render')
    const vm = this
    return vm.$options.render.call(vm) // 通过 ast 语法转义后生成的 render 方法
  }
}

export function callHook(vm, hook) {
  const handlers = vm.$options[hook]
  if (handlers) {
    handlers.forEach((handler) => {
      handler.call(vm)
    })
  }
}
