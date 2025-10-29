import { observe } from './observe/index'
import { nextTick, Watcher } from './observe/watcher'
import Dep from './observe/dep'

export function initState(vm) {
  const opts = vm.$options

  if (opts.data) {
    initData(vm)
  }

  if (opts.computed) {
    initComputed(vm)
  }

  if (opts.watch) {
    initWatch(vm)
  }
}

function initWatch(vm) {
  const watch = vm.$options.watch
  for (let key in watch) {
    // 字符串、数组、函数
    const handler = watch[key]
    if (Array.isArray(handler)) {
      // 如果是数组，我就去循环创建
      handler.forEach((handler) => {
        createWatcher(vm, key, handler)
      })
    } else {
      createWatcher(vm, key, handler)
    }
  }
}

function createWatcher(vm, key, handler) {
  // vm.$watch()
  if (typeof handler === 'string') {
    handler = vm[handler]
  }

  return vm.$watch(key, handler)
}

function initComputed(vm) {
  const computed = vm.$options.computed
  const watchers = (vm._computedWatchers = {}) // 将计算属性 watchers 保存到 vm 上
  for (let key in computed) {
    let computedValue = computed[key]

    // 我们需要监控，计算属性中 get 的变化
    const fn =
      typeof computedValue === 'function' ? computedValue : computedValue.get
    // 如果直接 watcher 就会默认执行 fn
    // 将属性和 watcher 对应起来
    watchers[key] = new Watcher(vm, fn, {
      lazy: true, // 懒惰 watcher
    })
    defineComputed(vm, key, computedValue)
  }
}

function defineComputed(target, key, computedValue) {
  // 有可能是对象，有可能是函数
  const getter =
    typeof computedValue === 'function' ? computedValue : computedValue.get
  const setter = computedValue.set || (() => {})

  // 可以通过实例拿到对应的属性
  Object.defineProperty(target, key, {
    get: createComputedGetter(key),
    set: setter,
  })
}

// 计算属性根本不会收集依赖，只会让自己的依赖属性去收集依赖
function createComputedGetter(key) {
  // 我们需要检测是否要执行这个 getter
  return function () {
    const watcher = this._computedWatchers[key] // 获取到对应属性的 watcher
    if (watcher.dirty) {
      // 如果是脏的，就去执行用户传入的函数
      watcher.evaluate() // 求值后，dirty 变为了 false，下次就不会在求值了
    }
    // 计算属性出栈后，还有渲染 watcher，我应该让 watcher 里面的属性也去收集上层的 watcher
    if (Dep.target) {
      watcher.depend()
    }
    return watcher.value
  }
}

function initData(vm) {
  let data = vm.$options.data // data 可能是函数和对象

  data = typeof data === 'function' ? data.call(this) : data

  vm._data = data
  // 对数据进行接触，vue2中采用了一个api： defineProperty
  observe(data)

  // 将 vm._data 用 vm 来代理就可以了
  for (const key in data) {
    proxy(vm, '_data', key)
  }
}

function proxy(vm, target, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[target][key]
    },
    set(val) {
      vm[target][key] = val
    },
  })
}

export function initStateMixin(Vue) {
  Vue.prototype.$nextTick = nextTick

  // 最终调用的都是这个方法
  Vue.prototype.$watch = function (exprOrFn, cb) {
    // 参数：{deep: true, immediate: true} // 先不处理了
    // console.log(exprOrFn, cb)
    // exprOrFn 可能是字符串，有可能是函数 firstName ,() => vm.firstName
    // new Watcher(this)

    // firstName的值变化了，直接执行 cb
    new Watcher(this, exprOrFn, { user: true }, cb)
  }
}
