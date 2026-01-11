// 实现 new Proxy(target, handler)
// 是不是仅读的，仅读的属性 set 时候会报异常
// 是不是深度的，

import {
  extend,
  hasChanged,
  hasOwn,
  isArray,
  isIntergerKey,
  isObject,
} from '@vue/shared'
import {
  reactive,
  readonly,
  track,
  TrackOpTypes,
  trigger,
  TriggerOrTypes,
} from '@vue/reactivity'

function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key, receiver) {
    // proxy + reflect
    const res = Reflect.get(target, key, receiver)
    // 后续 object 上的方法，会被迁移到 Reflect Reflect.getProptypeof()
    // 以前 target[key] = value 方式 设置值可能会失败，但是并不会报异常，也没有返回值标识
    // Reflect 方法具备返回值
    // Reflect 使用可以不使用 proxy es6语法
    if (!isReadonly) {
      // 这里要收集依赖，等会数据变化后更新对应的视图
      console.log('执行 effect 时候会取值，收集 effect')
      track(target, TrackOpTypes.GET, key)
    }
    if (shallow) {
      return res
    }
    if (isObject(res)) {
      // vue2 是一上来就递归
      // Vue3 是当取值的时候才进行带来，vue3的代理模式是懒代理
      return isReadonly ? readonly(res) : reactive(res)
    }
    return res
  }
}

const get = createGetter()
const shallowGet = createGetter(false, true)
const readonlyGet = createGetter(true, false)
const shallowReadonlyGet = createGetter(true, true)

function createSetter(shallow = false) {
  return function set(target, key, value, receiver) {
    // 先获取老值,在进行 Reflect.set 修改值之前
    const oldValue = target[key]
    // 这个判断也需要在 Reflect.set 前面
    const hadKey =
      isArray(target) && isIntergerKey(key)
        ? Number(key) < target.length
        : hasOwn(target, key)

    const res = Reflect.set(target, key, value, receiver)
    // 当数据更新的时候 ，通知对应属性的 effect 重新执行

    // 这里我们要区分是新增的，还是修改的
    // vue2中无法监控更改索引，无法监控数组的长度，因此 vue2中使用了 hack 的方法特殊处理了
    // vue3中都解决了

    // 这里判断 target 是数组，同时 key 是索引数字，即修改的是数组的索引
    if (!hadKey) {
      // 新增
      trigger(target, TriggerOrTypes.ADD, key, value)
    } else if (hasChanged(oldValue, value)) {
      // 修改
      trigger(target, TriggerOrTypes.SET, key, value, oldValue)
    }
    return res
  }
}

const set = createSetter()
const shallowSet = createSetter(true)

export const mutableHanders = {
  get,
  set,
}
export const shallowReactiveHandlers = {
  get: shallowGet,
  set: shallowSet,
}

const readonlyObj = {
  set: (target, key) => {
    console.warn(`set on ky ${key} failed`)
  },
}
export const readonlyHandlers = extend(
  {
    get: readonlyGet,
  },
  readonlyObj,
)
export const shallowReadonlyHandlers = extend(
  {
    get: shallowReadonlyGet,
  },
  readonlyObj,
)
