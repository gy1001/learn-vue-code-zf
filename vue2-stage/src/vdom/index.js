// 这个样子和ast一样吗？
// ast 做的是语法层面的转换，它描述的是语法本身（可以描述 js css html）
// 这里我们的虚拟 DOM 是描述的 DOM 元素，可以增加一些自定义属性(描述 dom 元素)
import { isReservedTag } from './patch'

function vNode(vm, tag, key, data, children, text, componentOptions) {
  return {
    tag,
    data,
    children,
    text,
    key,
    componentOptions, // 组件的构造函数
  }
}

// h() _c()
export function createElementVNode(vm, tag, props = {}, ...children) {
  const key = props?.key
  delete props?.key
  if (isReservedTag(tag)) {
    return vNode(vm, tag, key, props, children)
  } else {
    // 自定义组件
    // 创造一个组件的虚拟节点（包含组件的构造函数）
    let cTor = vm.$options.components[tag] // 找到组件的构造函数
    // 增加一个钩子
    props.hook = {
      init(vNode) {
        // 稍后创建真实节点的时候，如果是组件就调用此 init 方法, 接受组件节点对象
        let cTor = vNode.componentOptions.cTor // 找到其中的 cTor 函数
        let instance = (vNode.componentInstance = new cTor()) // 保存实例到虚拟节点 vNode 上
        instance.$mount() // 这里走完之后，instance 就增加一个属性 $el
      },
    }

    return createComponentVNode(vm, tag, key, props, children, cTor)
  }
}

function createComponentVNode(vm, tag, key, data, children, cTor) {
  if (typeof cTor === 'object') {
    cTor = vm.$options._base.extend(cTor)
  }
  return vNode(vm, tag, key, data, children, null, { cTor })
}

// _v()
export function createTextVNode(vm, text) {
  return vNode(vm, undefined, undefined, undefined, undefined, text)
}

export function isSameVNode(vnode1, vnode2) {
  return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key
}
