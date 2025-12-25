import Vue from 'vue'
import Vuex from 'vuex'
import modules from "./modules/index"

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    // 公共状态
  },
  getters: {},
  mutations: {},
  actions: {},
  modules: {
    ...modules
  }
})

export default store