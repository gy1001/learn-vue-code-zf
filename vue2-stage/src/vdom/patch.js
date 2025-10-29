import { isSameVNode } from './index'

export function patchProps(el, props) {
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

export function createElm(vNode) {
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

export function patch(oldVNode, vNode) {
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
    console.log(oldVNode, vNode)
    // 1. 两个节点不是同一个节点，直接删除老的上的新的（没有比对了)
    // 2. 两个节点是同一个节点（判断节点的 tag 和节点的 key)比较两个节点的属性是否有差异（复用老的节点，将差异的属性更新）
    // 3. 节点比较完成后 ，就需要比较两个人的儿子

    if (!isSameVNode(oldVNode, vNode)) {
      // 用老节点的父亲节点进行替换
      const el = createElm(vNode)
      oldVNode.el.parentNode.replaceChild(el, oldVNode.el)
      return el
    }
  }
}
