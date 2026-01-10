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
      return fn()// 函数取值的时候会取值，执行 get，
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
    depsMap.set(key, dep = new Set())
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