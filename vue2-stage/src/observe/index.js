import { newArrayProto } from "./array";
import Dep from "./dep";

class Observer {
  constructor(data) {
    // 给每个对象都增加收集功能
    this.dep = new Dep();

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

// 深层次嵌套会递归，递归多了性能差，不存在的属性监控不到，存在的属性又重写方法
// vue3 采用了 proxy，省略了这些过程
function dependArray(arr) {
  for (let i = 0; i < arr.length; i++) {
    let current = arr[i];
    // 如果 current 是一个数组中的字符串，就没有__ob__
    if (current.__ob__) {
      current.__ob__.dep.depend();
    }
    if (Array.isArray(current)) {
      dependArray(current);
    }
  }
}

// 属性劫持
export function defineReactive(target, key, value) {
  // 如果还是对象，就需要再次进行劫持
  const childOb = observe(value); // childOb上就有 dep 属性，用来收集依赖
  // 这里使用了闭包
  let dep = new Dep(); // 每一个属性都有一个 dep
  Object.defineProperty(target, key, {
    configurable: true,
    get() {
      console.log("用户取值了,key: ", key, value);
      // 取值的时候,会执行 get
      dep.depend();
      if (childOb) {
        childOb.dep.depend(); // 让数组和对象本身也实现依赖收集，以前针对的是属性，现在增加对象本身
        // 这里还要做判断，如果当前值是数组
        if (Array.isArray(value)) {
          dependArray(value);
        }
      }
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
