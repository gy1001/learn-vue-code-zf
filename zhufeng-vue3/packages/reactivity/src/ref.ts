// value 是一个普通类型
// ref和 reactive 区别就是 reactive 内部使用了 proxy，而 ref 内部使用的是 defineProperty
export function ref(value) {
  // 将普通类型变成一个对象
  // 也可以是对象，但是一般情况下如果是对象直接使用 reactive 更合理
  return createRef(value)
}

export function shallowRef(value: any) {
  return createRef(value, true)
}

class RefImpl {
  // 表示 声明了一个 value 属性，但是没有赋值
  public _value: any
  public __v_isRef = true // 产生的实例会被添加到 __v_isRef 表示是一个 ref 属性
  constructor(
    // 参数中前面增加修饰符，标识此属性放到了实例上
    public rawValue: any,
    public shallow,
  ) {}
}

// 后续看 vue 的源码，基本上都是高阶函数，做了类似柯里化的功能
function createRef(rawValue, shallow = false) {
  return new RefImpl(rawValue, shallow)
}
