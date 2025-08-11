import {initMixin} from "./init"

Vue.prototype.xx = function (options){
  // options 就是用户的选项
  this._init(options)
}


initMixin(Vue)

export default Vue;