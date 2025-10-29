import { isSameVNode } from './index'

export function patchProps(el, oldProps, props) {
  // 老的属性，在新的属性占用没有，要进行删除
  const oldStyles = oldProps.style || {}
  const newStyles = props.style || {}
  // 先处理 style 属性
  for (const key in oldStyles) {
    if (!newStyles[key]) {
      el.style[key] = ''
    }
  }

  // 再处理其他的 props
  for (const key in oldProps) {
    // 老的属性中有，新的属性中没有，进删除
    if (!props[key]) {
      el.removeAttribute(key)
    }
  }

  // 用新的属性覆盖老的属性
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
    patchProps(vNode.el, {}, data)
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
    patchVNode(oldVNode, vNode)
    // 1. 两个节点不是同一个节点，直接删除老的上的新的（没有比对了)
    // 2. 两个节点是同一个节点（判断节点的 tag 和节点的 key)比较两个节点的属性是否有差异（复用老的节点，将差异的属性更新）
    // 3. 节点比较完成后 ，就需要比较两个人的儿子
  }
}

function patchVNode(oldVNode, vNode) {
  if (!isSameVNode(oldVNode, vNode)) {
    // 用老节点的父亲节点进行替换
    const el = createElm(vNode)
    oldVNode.el.parentNode.replaceChild(el, oldVNode.el)
    return el
  }
  console.log(oldVNode.tag, vNode.el, 222222222)
  // -------------接下来就是相同的节点----------------------
  const el = (vNode.el = oldVNode.el) // 复用老节点的元素
  // 文本的情况，文本我们期望比较一下文本的内容
  if (!oldVNode.tag) {
    // 是文本
    if (oldVNode.text !== vNode.text) {
      oldVNode.el.textContent = vNode.text // 用新的节点覆盖掉老的节点
    }
  }
  // 是标签，我们需要比对标签的属性
  console.log(oldVNode, vNode)
  patchProps(el, oldVNode.data, vNode.data)

  return el
}
