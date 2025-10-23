import { initMixin } from './init'
import { initLifeCycle } from './lifecycle'
import { nextTick } from './observe/watcher'
import { initGlobalApi } from './globalApi'

function Vue(options) {
  // options 就是用户的选项
  this._init(options)
}

Vue.prototype.$nextTick = nextTick

initMixin(Vue)
initLifeCycle(Vue)
initGlobalApi(Vue)

export default Vue
