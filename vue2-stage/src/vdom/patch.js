import { isSameVNode } from './index'

export const isReservedTag = (tag) => {
  return ['a', 'div', 'p', 'h1', 'span', 'button'].includes(tag)
}

export function patchProps(el, oldProps = {}, props = {}) {
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

function createComponent(vNode) {
  let i = vNode.data
  if ((i = i.hook) && (i = i.init)) {
    // 如果 i.hook.init 上面有值，说明是组件
    i(vNode) //初始化节点
  }
  // 如果 vNode.componentInstance 说明是组件
  return vNode.componentInstance
}

// 创建真实节点：这里要区分是组件还是元素
export function createElm(vNode) {
  const { tag, children = [], data, text } = vNode
  if (typeof tag === 'string') {
    if (createComponent(vNode)) {
      // 组件, 这里执行通过后，vNode.componentInstance 身上就有一个 $el
      return vNode.componentInstance.$el // 这里父组件循环时候，最终会在下面被 appendChild 到父节点中
    }
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
  // 如果是自定义组件，oldVNode 就是空的
  if (!oldVNode) {
    return createElm(vNode)
  }
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
    return patchVNode(oldVNode, vNode)
    // 1. 两个节点不是同一个节点，直接删除老的上的新的（没有比对了)
    // 2. 两个节点是同一个节点（判断节点的 tag 和节点的 key)比较两个节点的属性是否有差异（复用老的节点，将差异的属性更新）
    // 3. 节点比较完成后 ，就需要比较两个人的儿子
  }
}

function patchVNode(oldVNode, vNode) {
  if (!isSameVNode(oldVNode, vNode)) {
    // 用老节点的父亲节点进行替换
    let el = createElm(vNode)
    oldVNode.el.parentNode.replaceChild(el, oldVNode.el)
    return el
  }
  // -------------接下来就是相同的节点----------------------
  let el = (vNode.el = oldVNode.el) // 复用老节点的元素

  // 文本的情况，文本我们期望比较一下文本的内容
  if (!oldVNode.tag) {
    // 是文本
    if (oldVNode.text !== vNode.text) {
      oldVNode.el.textContent = vNode.text // 用新的节点覆盖掉老的节点
    }
  }
  // 是标签，我们需要比对标签的属性
  patchProps(el, oldVNode.data, vNode.data)

  // 接下来比较儿子节点
  // 1. 一方有儿子，一方没有儿子
  // 2. 两方都有儿子

  const oldChildren = oldVNode.children || []
  const newChildren = vNode.children || []
  if (oldChildren.length > 0 && newChildren.length > 0) {
    // 完整的 diff 算法。比较两方的儿子
    updateChildren(el, oldChildren, newChildren)
  } else if (newChildren.length > 0) {
    // 老节点没有儿子，新节点有儿子
    mountChildren(el, newChildren)
  } else if (oldChildren.length > 0) {
    // 老节点有儿子，新节点没有儿子
    unMountChildren(el, oldChildren)
  }
  return el
}

function mountChildren(el, children) {
  for (let i = 0; i < children.length; i++) {
    const childEl = createElm(children[i])
    el.appendChild(childEl)
  }
}

function unMountChildren(el, oldChildren) {
  for (let i = 0; i < oldChildren.length; i++) {
    oldChildren[i].el.remove()
  }
}

function updateChildren(el, oldChildren, newChildren) {
  // 我们操作列表时候，经常是会有 push shift pop unshift revers sort 这些方法（针对这些情况做一个优化）
  // vue2 中采用双指针的方法，比较两个节点

  let oldStartIndex = 0
  let newStartIndex = 0
  let oldEndIndex = oldChildren.length - 1
  let newEndIndex = newChildren.length - 1

  let newStartVNode = newChildren[newStartIndex]
  let oldStartVNode = oldChildren[oldStartIndex]
  let newEndVNode = newChildren[newEndIndex]
  let oldEndVNode = oldChildren[oldEndIndex]

  function makeIndexByKey(children) {
    const map = {}
    children.forEach((child, index) => {
      map[child.key] = index
    })
    return map
  }

  let oldChildrenKeyMap = makeIndexByKey(oldChildren)
  console.log(oldChildrenKeyMap)

  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    // 双方有一方头指针索引，大于尾部指针索引就停止循环（必须同时满足）
    // 我们为了比较两个儿子的时候提高比较性能，会采取一些策略
    if (!oldStartVNode) {
      oldStartVNode = oldChildren[++oldStartIndex]
    } else if (!oldEndVNode) {
      oldEndVNode = oldChildren[++oldEndIndex]
    } else if (isSameVNode(oldStartVNode, newStartVNode)) {
      // 如果是相同节点，则递归比较子节点
      patchVNode(oldStartVNode, newStartVNode)
      // 然后双方头指针后移
      oldStartVNode = oldChildren[++oldStartIndex]
      newStartVNode = newChildren[++newStartIndex]
      // 比较开头节点
    } else if (isSameVNode(oldEndVNode, newEndVNode)) {
      patchVNode(oldEndVNode, newEndVNode)
      oldEndVNode = oldChildren[--oldEndIndex]
      newEndVNode = newChildren[--newEndIndex]
    } else if (isSameVNode(oldEndVNode, newStartVNode)) {
      console.log('3️⃣旧后与新前进行比较')
      // 开始交叉比对
      patchVNode(oldEndVNode, newStartVNode)
      // 把旧后节点移动到旧前节点前面
      el.insertBefore(oldEndVNode.el, oldStartVNode.el)
      oldEndVNode = oldChildren[--oldEndIndex]
      newStartVNode = newChildren[++newStartIndex]
    } else if (isSameVNode(oldStartVNode, newEndVNode)) {
      // 开始交叉比对
      console.log('4️⃣旧前与新后进行比较')
      patchVNode(oldStartVNode, newEndVNode)
      // 把旧前节点移动到旧后节点后面
      el.insertBefore(oldStartVNode.el, oldEndVNode.el.nextSibling)
      oldStartVNode = oldChildren[++oldStartIndex]
      newEndVNode = newChildren[--newEndIndex]
    } else {
      console.log('5️⃣乱序比较')
      // 乱序比较：
      // 根据老的列表做一个映射关系，用新的去找，找到则移动，找不到则添加，最后多余的进行删除
      let moveIndex = oldChildrenKeyMap[newStartVNode.key]
      if (moveIndex !== undefined) {
        // 找到当前需要移动的元素
        let currentMoveVNode = oldChildren[moveIndex] // 找到需要移动的虚拟节点 复用
        el.insertBefore(currentMoveVNode.el, oldStartVNode.el)
        // 并且清空当前老节点的元素
        oldChildren[moveIndex] = undefined // 标识这个节点已经移走了
        // 并且要对当前新节点 和找到的那个节点进行属性更新 patchVNode
        patchVNode(currentMoveVNode, newStartVNode)
      } else {
        // 如果找不到
        el.insertBefore(createElm(newStartVNode), oldStartVNode.el)
      }
      // 移动指针
      newStartVNode = newChildren[++newStartIndex]
    }
    // 再给动态列表添加 key 的时候，要尽量避免使用索引，因为索引新旧节点都是从 0开始的，可能会发生错误复用
  }

  if (newStartIndex <= newEndIndex) {
    // 新的节点有新增的，对多余的就插入进入
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      // 这里可能是向后追加，也可能是向前追加
      // el.appendChild(createElm(newChildren[i]))

      const anchor = newChildren[newEndIndex + 1]
        ? newChildren[newEndIndex + 1].el
        : null // 获取下一个元素，可能不存在,可能存在，当做一个参照物
      el.insertBefore(createElm(newChildren[i]), anchor) // 当anchor为null时候,则会认为是 appendChild
    }
  }
  if (oldStartIndex <= oldEndIndex) {
    // 旧的节点有多余的，需要删除老的节点
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      if (oldChildren[i]) {
        el.removeChild(oldChildren[i].el)
      }
    }
  }

  // 如果批量向页面中修改插入内容，浏览器会自动优化的
}
