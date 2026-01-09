import { isObject } from "@vue/shared";
import {
  mutableHanders,
  readonlyHandlers,
  shallowReadonlyHandlers,
  shallowReactiveHandlers,
} from "./baseHandler";

export function reactive(target) {
  return createReactiveObject(target, false, mutableHanders);
}

export function shallowReactive(target) {
  return createReactiveObject(target, false, shallowReactiveHandlers);
}

export function readonly(target) {
  return createReactiveObject(target, true, readonlyHandlers);
}

export function shallowReadonly(target) {
  return createReactiveObject(target, true, shallowReadonlyHandlers);
}

// 会垃圾回收，不会造成内存泄露， 存储的 key 只能是对象
const reactiveMap = new WeakMap();
const readonlyMap = new WeakMap();

// 是不是深度，是不是仅读，做柯里化
//new Proxy 最核心的需要拦截，数据的读取和数据的修改 get set
export function createReactiveObject(target, isReadonly, baseHandler) {
  // 如果目标不是对象，没法拦截了，reactive 这个 api 只能拦截对象类型
  if (!isObject(target)) {
    return;
  }
  // 如果某个对象已经被代理过了，就不要再代理了。可能一个对象，被代理是深度，又被仅读代理了
  const proxyMap = isReadonly ? readonlyMap : reactiveMap;

  let existMap = proxyMap.get(target);
  if (existMap) {
    // 如果已经被代理了，就直接返回即可
    return existMap;
  }

  const proxy = new Proxy(target, baseHandler);
  // 将要代理的对象和对应代理结果缓存起来
  proxyMap.set(target, proxy);

  return proxy;
}
