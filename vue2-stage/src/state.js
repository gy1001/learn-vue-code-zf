import { observe } from './observe/index'

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

  for (let key in computed) {
    let computedValue = computed[key]

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
    get: getter,
    set: setter,
  })
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
