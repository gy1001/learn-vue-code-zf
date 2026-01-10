const isObject = (value) => {
    return typeof value === "object" && value !== null;
};
const extend = Object.assign;

// 实现 new Proxy(target, handler)
// 是不是仅读的，仅读的属性 set 时候会报异常
// 是不是深度的，
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key, receiver) {
        // proxy + reflect
        const res = Reflect.get(target, key, receiver);
        // 后续 object 上的方法，会被迁移到 Reflect Reflect.getProptypeof()
        // 以前 target[key] = value 方式 设置值可能会失败，但是并不会报异常，也没有返回值标识
        // Reflect 方法具备返回值
        // Reflect 使用可以不使用 proxy es6语法
        if (!isReadonly) {
            // 这里要收集依赖，等会数据变化后更新对应的视图
            console.log("执行 effect 时候会取值，收集 effect");
            track(target, 0 /* TrackOpTypes.GET */, key);
        }
        if (shallow) {
            return res;
        }
        if (isObject(res)) {
            // vue2 是一上来就递归
            // Vue3 是当取值的时候才进行带来，vue3的代理模式是懒代理
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
const get = createGetter();
const shallowGet = createGetter(false, true);
const readonlyGet = createGetter(true, false);
const shallowReadonlyGet = createGetter(true, true);
function createSetter(shallow = false) {
    return function set(target, key, value, receiver) {
        const res = Reflect.set(target, key, value, receiver);
        // 当数据更新的时候 ，通知对应属性的 effect 重新执行
        return res;
    };
}
const set = createSetter();
const shallowSet = createSetter(true);
const mutableHanders = {
    get,
    set
};
const shallowReactiveHandlers = {
    get: shallowGet,
    set: shallowSet,
};
const readonlyObj = {
    set: (target, key) => {
        console.warn(`set on ky ${key} failed`);
    },
};
const readonlyHandlers = extend({
    get: readonlyGet,
}, readonlyObj);
const shallowReadonlyHandlers = extend({
    get: shallowReadonlyGet,
}, readonlyObj);

function reactive(target) {
    return createReactiveObject(target, false, mutableHanders);
}
function shallowReactive(target) {
    return createReactiveObject(target, false, shallowReactiveHandlers);
}
function readonly(target) {
    return createReactiveObject(target, true, readonlyHandlers);
}
function shallowReadonly(target) {
    return createReactiveObject(target, true, shallowReadonlyHandlers);
}
// 会垃圾回收，不会造成内存泄露， 存储的 key 只能是对象
const reactiveMap = new WeakMap();
const readonlyMap = new WeakMap();
// 是不是深度，是不是仅读，做柯里化
//new Proxy 最核心的需要拦截，数据的读取和数据的修改 get set
function createReactiveObject(target, isReadonly, baseHandler) {
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

function effect(fn, options = {}) {
    // 我们需要让这个 effect 变成响应式的 effect，可以做到数据变化重新执行
    const effect = createReactiveEffect(fn, options);
    if (!options.lazy) {
        effect(); // 响应式的 effect 默认会先执行一次
    }
    return effect;
}
let uid = 0;
let activeEffect;
let effectStack = []; // 存储当前的 effect,需要是个栈，因为可能会有嵌套的问题
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
            return;
        }
        // 后续保证 effect 没有加入到 effectStack 中才进行添加
        try {
            // console.log("默认会执行")
            effectStack.push(effect);
            activeEffect = effect;
            return fn(); // 函数取值的时候会取值，执行 get，
        }
        finally {
            effectStack.pop();
            activeEffect = effectStack[effectStack.length - 1];
        }
    };
    effect.id = uid++; // 制作一个 effect 标识，用于区分 effect
    effect._isEffect = true; // 用于标识这个是响应式 effect
    effect.raw = fn; // 保留 effect 对应的原函数
    effect.options = options; // 在 effect 上保存用户的属性
    return effect;
}
const targetMap = new WeakMap();
// 让某个对象中的属性收集当前对应的 effect 函数
function track(target, type, key) {
    // 这里就可以拿到 activeEffect: 它是当前正在运行的 effect
    // console.log(target, key, activeEffect)
    if (activeEffect === undefined) {
        // 此属性不用收集依赖，因为没在 effect 中使用
        return;
    }
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()));
    }
    let dep = depsMap.get(key);
    if (!dep) {
        depsMap.set(key, dep = new Set());
    }
    if (!dep.has(activeEffect)) {
        dep.add(activeEffect);
    }
}
// 收集依赖中的结构大概类似如下
// 比如 target 是 {name: 'xx', age: 'xx' }
// key可能是 name，可能是 age，然后 key 对应的可能是多个 effect，应该是一个 set 类型
//{name: 'xx', age: 'xx' } => name => [effect, effect]
// 所以这里我们使用 weakMap
// weakMap: key => { name:'zf',age: 12} value: map => {name => set}

export { effect, reactive, readonly, shallowReactive, shallowReadonly, track };
//# sourceMappingURL=reactivity.esm-bundler.js.map
