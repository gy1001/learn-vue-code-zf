import { observe } from './observe/index'
import { Watcher } from './observe/watcher'

export function initState(vm) {
  const opts = vm.$options

  if (opts.data) {
    initData(vm)
  }

  if (opts.computed) {
    initComputed(vm)
  }
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

// 我们需要检测是否要执行这个 getter
function createComputedGetter(key) {
  return function () {
    const watcher = this._computedWatchers[key] // 获取到对应属性的 watcher
    if (watcher.dirty) {
      // 如果是脏的，就去执行用户传入的函数
      watcher.evaluate() // 求值后，dirty 变为了 false，下次就不会在求值了
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
