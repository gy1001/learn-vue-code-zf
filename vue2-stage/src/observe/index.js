import { newArrayProto } from "./array";
import Dep from "./dep";

class Observer {
  constructor(data) {
    // Object.defineProperty 只能劫持已经存在的属性，新增、删除的都无法
    // vue2中为此还专门写了一个api: $set $delete
    // data.__ob__ = this; // 这里直接赋值会导致死循环，一直加__ob__
    Object.defineProperty(data, "__ob__", {
      value: this,
      configurable: false, // 将 __ob__ 变为不可枚举
    });
    if (Array.isArray(data)) {
      // 我们可以重写数组中的方法: 7个变异方法，它们可以修改原数组

      data.__proto__ = newArrayProto; // 这里需要保留数组原有弹性，并且可以重写部分方法
      // 数组中还有引用类型属性的数据：
      this.observeArray(data);
    } else {
      this.walk(data);
    }
  }

  observeArray(data) {
    data.forEach((item) => {
      observe(item);
    });
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
  let dep = new Dep(); // 每一个属性都有一个 dep
  Object.defineProperty(target, key, {
    configurable: true,
    get() {
      console.log("用户取值了,key: ", key, value);
      console.log(Dep.target, "1111111111");
      // 取值的时候,会执行 get
      dep.depend();
      return value;
    },
    set(newValue) {
      console.log("用户设置值了,key: ", key, newValue);
      // 修改的时候，会执行 set
      if (newValue !== value) {
        // 如果设置的是对象，也要进行劫持响应化处理
        observe(newValue);
        value = newValue;
        // 通知相关依赖更新
        dep.notify();
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
  if (data.__ob__ instanceof Observer) {
    return data.__ob__;
  }
  return new Observer(data);
}
