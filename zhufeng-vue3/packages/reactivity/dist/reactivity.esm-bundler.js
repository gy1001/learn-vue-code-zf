const isObject = (value) => {
    return typeof value === 'object' && value !== null;
};
const extend = Object.assign;
const isArray = Array.isArray;
const isIntergerKey = (key) => parseInt(key) + '' === key;
let hasOwnProperty = Object.prototype.hasOwnProperty;
const hasOwn = (target, key) => hasOwnProperty.call(target, key);
const hasChanged = (oldValue, value) => oldValue !== value;

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
            console.log('执行 effect 时候会取值，收集 effect');
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
        // 先获取老值,在进行 Reflect.set 修改值之前
        const oldValue = target[key];
        // 这个判断也需要在 Reflect.set 前面
        const hadKey = isArray(target) && isIntergerKey(key)
            ? Number(key) < target.length
            : hasOwn(target, key);
        const res = Reflect.set(target, key, value, receiver);
        // 当数据更新的时候 ，通知对应属性的 effect 重新执行
        // 这里我们要区分是新增的，还是修改的
        // vue2中无法监控更改索引，无法监控数组的长度，因此 vue2中使用了 hack 的方法特殊处理了
        // vue3中都解决了
        // 这里判断 target 是数组，同时 key 是索引数字，即修改的是数组的索引
        if (!hadKey) {
            // 新增
            trigger(target, 0 /* TriggerOrTypes.ADD */, key, value);
        }
        else if (hasChanged(oldValue, value)) {
            // 修改
            trigger(target, 1 /* TriggerOrTypes.SET */, key, value, oldValue);
        }
        return res;
    };
}
const set = createSetter();
const shallowSet = createSetter(true);
const mutableHanders = {
    get,
    set,
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
        depsMap.set(key, (dep = new Set()));
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
// 找到对应的 effect 让其执行（数组、对象）
function trigger(target, type, key, newValue, oldValue) {
    console.log('trigger', target, type, key, newValue, oldValue);
    // 如果这个属性没有收集过 effect, 那么不需要做任何操作
    const depsMap = targetMap.get(target);
    if (!depsMap) {
        return;
    }
    // 我要将所有的需要执行的 effect 全部存到一个新的集合中，最终一起执行
    const effects = new Set(); // 这里对 effect 进行了去重
    const add = (effectsToAdd) => {
        if (effectsToAdd) {
            effectsToAdd.forEach((effect) => {
                effects.add(effect);
            });
        }
    };
    // 1. 看修改的是否是数组的长度，因为修改长度影响的比较大
    if (key === 'length' && isArray(target)) {
        // 如果对应的长度有依赖收集
        depsMap.forEach((dep, depKey) => {
            if (depKey === 'length' || depKey > newValue) {
                // length 改动，缩减了数组的长度
                add(dep);
            }
        });
    }
    else {
        // 可能是对象
        console.log(key);
        if (key !== undefined) {
            // 如果是新增，depsMap.get(key)就获取不到，也没有问题
            add(depsMap.get(key));
        }
        // 如果修改数组中的某一个索引，怎么办？
        // state.arr[100] = 1
        // 这里添加一个索引的话，也需要添加 length 的 effect
        switch (type) {
            case 0 /* TriggerOrTypes.ADD */:
                if (isArray(target) && isIntergerKey(key)) {
                    add(depsMap.get('length'));
                }
        }
    }
    effects.forEach((effect) => {
        effect();
    });
}

// value 是一个普通类型
// ref和 reactive 区别就是 reactive 内部使用了 proxy，而 ref 内部使用的是 defineProperty
function ref(value) {
    // 将普通类型变成一个对象
    // 也可以是对象，但是一般情况下如果是对象直接使用 reactive 更合理
    return createRef(value);
}
const convert = (value) => (isObject(value) ? reactive(value) : value);
// beta 之前的版本中 ref 就是一个对象，由于对象不方便扩展，后面改为了类 class
class RefImpl {
    rawValue;
    shallow;
    __v_isRef = true; // 产生的实例会被添加到 __v_isRef 表示是一个 ref 属性
    constructor(
    // 参数中前面增加修饰符，标识此属性放到了实例上
    rawValue, shallow) {
        this.rawValue = rawValue;
        this.shallow = shallow;
        // 如果是深度，就需要把里面的都变成响应式的
        this._value = shallow ? rawValue : convert(rawValue);
    }
    // 表示 声明了一个 _value 属性，但是没有赋值
    _value;
    get value() {
        track(this, 0 /* TrackOpTypes.GET */, 'value');
        return this._value;
    }
    set value(newValue) {
        if (hasChanged(newValue, this.rawValue)) {
            // 判断新值 老值 有变化
            this.rawValue = newValue; // 新值作为原始值
            this._value = this.shallow ? newValue : convert(newValue);
            trigger(this, 1 /* TriggerOrTypes.SET */, 'value', newValue);
        }
    }
}
// 后续看 vue 的源码，基本上都是高阶函数，做了类似柯里化的功能
function createRef(rawValue, shallow = false) {
    return new RefImpl(rawValue, shallow);
}

export { effect, reactive, readonly, ref, shallowReactive, shallowReadonly, track, trigger };
//# sourceMappingURL=reactivity.esm-bundler.js.map
