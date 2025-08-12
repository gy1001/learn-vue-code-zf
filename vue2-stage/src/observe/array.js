// 我们重写数组中的部分方法

import { observe } from "./index";

const originArrayProto = Array.prototype; // 获取数组中的原型

// newArrayProto.__proto__ = originArrayProto
export let newArrayProto = Object.create(originArrayProto);

// 找到所有的变异方法：会改变原数组
const arrayMethods = [
  "push",
  "pop",
  "shift",
  "unshift",
  "splice",
  "sort",
  "reverse",
];

arrayMethods.forEach((method) => {
  // 这里重写数组的方法
  newArrayProto[method] = function (...args) {
    // 内部调用原来的方法，函数的劫持，切片编程
    const result = originArrayProto[method].call(this, ...args);
    console.log("方法被调用了, method: ", method);
    // 我们需要对新增的数据再次进行劫持
    let inserted;
    switch (method) {
      case "push":
      case "unshift":
        inserted = args;
        break;
      case "splice":
        inserted = args.slice(2);
        break;
      default:
        break;
    }
    // 对插入的数据进行劫持
    observe(inserted);
    return result;
  };
});
