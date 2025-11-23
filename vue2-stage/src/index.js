import { initMixin } from './init'
import { initLifeCycle } from './lifecycle'
import { initGlobalApi } from './globalApi'
import { initStateMixin } from './state'
function Vue(options) {
  // options 就是用户的选项
  this._init(options)
}

initMixin(Vue) // 扩展了 init 方法，
initLifeCycle(Vue) // vm._update vm._render
initGlobalApi(Vue) // 全局 api 的实现
initStateMixin(Vue) // 实现了 $nextTick $watch

export default Vue
