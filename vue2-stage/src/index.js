import { initMixin } from './init'
import { initLifeCycle } from './lifecycle'
import { initGlobalApi } from './globalApi'
import { initStateMixin } from './state'
import { compileToFunction } from './compiler/index'
import { createElm, patch } from './vdom/patch'
function Vue(options) {
  // options 就是用户的选项
  this._init(options)
}

initMixin(Vue) // 扩展了 init 方法，
initLifeCycle(Vue) // vm._update vm._render
initGlobalApi(Vue) // 全局 api 的实现
initStateMixin(Vue) // 实现了 $nextTick $watch

// 为了方便观察前后的虚拟节点，测试的
let render1 = compileToFunction(`<li style="color:red;" key="a">{{name}}</li>`)
const vm1 = new Vue({ data: { name: '珠峰' } })
const prevVNode = render1.call(vm1)
console.log(prevVNode)
const el1 = createElm(prevVNode)
document.body.appendChild(el1)

let render2 = compileToFunction(
  `<span style="color:red;background-color: blue" key="a">{{name}}</span>`,
)
const vm2 = new Vue({ data: { name: '珠峰2' } })
const nextVNode = render2.call(vm2)
console.log(nextVNode)
const el2 = createElm(nextVNode)

// 之前的做法：直接将新的节点替换掉老的
// 优化做法：不是直接替换，而是标记两个节点的区别之后再去替换
// diff 算法是一个平级比较的过程，父亲和父亲比较，儿子和儿子比较
setTimeout(() => {
  // el1.parentNode.replaceChild(el2, el1)
  patch(prevVNode, nextVNode)
}, 1000)

export default Vue
