import { isArray, isIntergerKey } from '@vue/shared'
import { TriggerOrTypes } from '@vue/reactivity'

export function effect(fn, options: any = {}) {
  // 我们需要让这个 effect 变成响应式的 effect，可以做到数据变化重新执行

  const effect = createReactiveEffect(fn, options)

  if (!options.lazy) {
    effect() // 响应式的 effect 默认会先执行一次
  }
  return effect
}

let uid = 0
let activeEffect
let effectStack = [] // 存储当前的 effect,需要是个栈，因为可能会有嵌套的问题
/*
effect(() => {
  state.name = "xx"
  effect(() => {
     state.age = "xxx"
  })
  state.address = "xxx"
})


 */

function createReactiveEffect(fn, options = {}) {
  const effect = function reactiveEffect() {
    if (effectStack.includes(effect)) {
      // 这里可以防止如下代码
      /**
       effect(() => { state.age ++  })
       // 如果没有做判断，就会循环执行
       */
      return
    }
    // 后续保证 effect 没有加入到 effectStack 中才进行添加

    try {
      // console.log("默认会执行")
      effectStack.push(effect)
      activeEffect = effect
      return fn() // 函数取值的时候会取值，执行 get，
    } finally {
      effectStack.pop()
      activeEffect = effectStack[effectStack.length - 1]
    }
  }
  effect.id = uid++ // 制作一个 effect 标识，用于区分 effect
  effect._isEffect = true // 用于标识这个是响应式 effect
  effect.raw = fn // 保留 effect 对应的原函数
  effect.options = options // 在 effect 上保存用户的属性
  return effect
}

const targetMap = new WeakMap()

// 让某个对象中的属性收集当前对应的 effect 函数
export function track(target, type, key) {
  // 这里就可以拿到 activeEffect: 它是当前正在运行的 effect
  // console.log(target, key, activeEffect)
  if (activeEffect === undefined) {
    // 此属性不用收集依赖，因为没在 effect 中使用
    return
  }
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }

  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect)
  }
}

// 收集依赖中的结构大概类似如下
// 比如 target 是 {name: 'xx', age: 'xx' }
// key可能是 name，可能是 age，然后 key 对应的可能是多个 effect，应该是一个 set 类型
//{name: 'xx', age: 'xx' } => name => [effect, effect]
// 所以这里我们使用 weakMap
// weakMap: key => { name:'zf',age: 12} value: map => {name => set}

// 找到对应的 effect 让其执行（数组、对象）
export function trigger(target, type, key, newValue?, oldValue?) {
  console.log('trigger', target, type, key, newValue, oldValue)

  // 如果这个属性没有收集过 effect, 那么不需要做任何操作
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    return
  }
  // 我要将所有的需要执行的 effect 全部存到一个新的集合中，最终一起执行
  const effects = new Set() // 这里对 effect 进行了去重
  const add = (effectsToAdd) => {
    if (effectsToAdd) {
      effectsToAdd.forEach((effect) => {
        effects.add(effect)
      })
    }
  }
  // 1. 看修改的是否是数组的长度，因为修改长度影响的比较大
  if (key === 'length' && isArray(target)) {
    // 如果对应的长度有依赖收集
    depsMap.forEach((dep, depKey) => {
      if (depKey === 'length' || depKey > newValue) {
        // length 改动，缩减了数组的长度
        add(dep)
      }
    })
  } else {
    // 可能是对象
    console.log(key)
    if (key !== undefined) {
      // 如果是新增，depsMap.get(key)就获取不到，也没有问题
      add(depsMap.get(key))
    }
    // 如果修改数组中的某一个索引，怎么办？
    // state.arr[100] = 1
    // 这里添加一个索引的话，也需要添加 length 的 effect
    switch (type) {
      case TriggerOrTypes.ADD:
        if (isArray(target) && isIntergerKey(key)) {
          add(depsMap.get('length'))
        }
    }
  }
  effects.forEach((effect: any) => {
    effect()
  })
}
