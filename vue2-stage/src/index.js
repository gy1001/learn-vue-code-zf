import { initMixin } from './init'
import { initLifeCycle } from './lifecycle'
import { nextTick, Watcher } from './observe/watcher'
import { initGlobalApi } from './globalApi'

function Vue(options) {
  // options 就是用户的选项
  this._init(options)
}

Vue.prototype.$nextTick = nextTick

initMixin(Vue)
initLifeCycle(Vue)
initGlobalApi(Vue)

// 最终调用的都是这个方法
Vue.prototype.$watch = function (exprOrFn, cb) {
  // 参数：{deep: true, immediate: true} // 先不处理了
  // console.log(exprOrFn, cb)
  // exprOrFn 可能是字符串，有可能是函数 firstName ,() => vm.firstName
  // new Watcher(this)

  // firstName的值变化了，直接执行 cb
  new Watcher(this, exprOrFn, { user: true }, cb)
}

export default Vue
