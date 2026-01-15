// value 是一个普通类型
// ref和 reactive 区别就是 reactive 内部使用了 proxy，而 ref 内部使用的是 defineProperty
import {
  reactive,
  track,
  TrackOpTypes,
  trigger,
  TriggerOrTypes,
} from '@vue/reactivity'
import { hasChanged, isArray, isObject } from '@vue/shared'

export function ref(value) {
  // 将普通类型变成一个对象
  // 也可以是对象，但是一般情况下如果是对象直接使用 reactive 更合理
  return createRef(value)
}

export function shallowRef(value: any) {
  return createRef(value, true)
}

const convert = (value) => (isObject(value) ? reactive(value) : value)

// beta 之前的版本中 ref 就是一个对象，由于对象不方便扩展，后面改为了类 class
class RefImpl {
  public __v_isRef = true // 产生的实例会被添加到 __v_isRef 表示是一个 ref 属性

  constructor(
    // 参数中前面增加修饰符，标识此属性放到了实例上
    public rawValue: any,
    public shallow,
  ) {
    // 如果是深度，就需要把里面的都变成响应式的
    this._value = shallow ? rawValue : convert(rawValue)
  }

  // 表示 声明了一个 _value 属性，但是没有赋值
  public _value: any

  get value() {
    track(this, TrackOpTypes.GET, 'value')
    return this._value
  }

  set value(newValue) {
    if (hasChanged(newValue, this.rawValue)) {
      // 判断新值 老值 有变化
      this.rawValue = newValue // 新值作为原始值
      this._value = this.shallow ? newValue : convert(newValue)
      trigger(this, TriggerOrTypes.SET, 'value', newValue)
    }
  }
}

// 后续看 vue 的源码，基本上都是高阶函数，做了类似柯里化的功能
function createRef(rawValue, shallow = false) {
  return new RefImpl(rawValue, shallow)
}

class ObjectRefImpl {
  public __v_isRef = true

  constructor(
    public target,
    public key,
  ) {}

  get value() {
    return this.target[this.key]
  }

  set value(newValue) {
    this.target[this.key] = newValue
  }
}

// 可以把一个对象的值转换为一个 ref 类型的
export function toRef(target, key) {
  return new ObjectRefImpl(target, key)
}

export function toRefs(object) {
  // object 可能是一个对象，也可能是一个数组
  const result = isArray(object) ? new Array(object.length) : {}
  for (const key in object) {
    result[key] = toRef(object, key)
  }
  return result
}
