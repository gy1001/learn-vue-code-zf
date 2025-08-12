class Observer {
  constructor(data) {
    // Object.defineProperty 只能劫持已经存在的属性，新增、删除的都无法
    // vue2中为此还专门写了一个api: $set $delete
    this.walk(data);
  }

  walk(data) {
    // 循环data对象，对属性依次进行劫持

    // “重新定义”属性：性能就有减弱了
    Object.keys(data).forEach((key) => defineReactive(data, key, data[key]));
  }
}

// 属性劫持
export function defineReactive(target, key, value) {
  // 如果还是对象，就需要再次进行劫持
  observe(value);
  // 这里使用了闭包
  Object.defineProperty(target, key, {
    configurable: true,
    get() {
      console.log("用户取值了,key: ", key);
      // 取值的时候,会执行 get
      return value;
    },
    set(newValue) {
      console.log("用户设置值了,key: ", key);
      // 修改的时候，会执行 set
      if (newValue !== value) {
        // 如果设置的是对象，也要进行劫持响应化处理
        observe(newValue);
        value = newValue;
      }
    },
  });
}

export function observe(data) {
  // 对这个对象进行劫持
  if (typeof data !== "object" || data == null) {
    return; // 只对对象进行劫持
  }
  // 如果一个对象被劫持过了，那就不需要在被劫持了
  // 要判断一个对象是否被劫持过，可以增加一个实例，用实例来判断是否被劫持过

  return new Observer(data);
}
