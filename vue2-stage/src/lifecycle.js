import { createElementVNode, createTextVNode } from './vdom/index'
import { Watcher } from './observe/watcher'

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
    vm.$el = patch(el, vNode)
  }

  Vue.prototype._render = function () {
    console.log('_render')
    const vm = this
    return vm.$options.render.call(vm) // 通过 ast 语法转义后生成的 render 方法
  }
}

function patchProps(el, props) {
  for (const key in props) {
    if (key === 'style') {
      for (const styleName in props.style) {
        el.style[styleName] = props.style[styleName]
      }
    } else {
      el.setAttribute(key, props[key])
    }
  }
}

function createElm(vNode) {
  const { tag, children = [], data, text } = vNode
  if (typeof tag === 'string') {
    // 这里将真实节点和虚拟节点对应起来，后续如果修改属性了
    vNode.el = document.createElement(tag)

    // 更新属性
    patchProps(vNode.el, data)
    children.forEach((child) => {
      const childElm = createElm(child)
      vNode.el.appendChild(childElm)
    })
  } else {
    vNode.el = document.createTextNode(text)
  }
  return vNode.el
}

function patch(oldVNode, vNode) {
  // 写的是初渲染流程
  const isRealElement = oldVNode.nodeType
  if (isRealElement) {
    console.log('这里进行渲染了')
    const elm = oldVNode // 获取真实元素
    const parentElm = elm.parentNode // 获取父元素
    const newElm = createElm(vNode)
    parentElm.insertBefore(newElm, elm.nextSibling)
    // 移除老节点
    parentElm.removeChild(elm)
    return newElm
  } else {
    console.log('TODO diff 算法')
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
