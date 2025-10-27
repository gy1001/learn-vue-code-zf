import Dep, { popTarget, pushTarget } from './dep.js'
let id = 0

// 1. 当我们创建渲染 watcher 的时候我们会把当前的渲染 watcher 放到 Dep.target上
// 2. 调用 _render() 会取值，就会走到 get 上

// 每个属性有一个 dep（属性就是被观察者），watcher 就是观察者（属性更新了通知观察者来更新）=> 观察者模式

export class Watcher {
  // 不同组件有不同的 watcher，目前只有一个渲染根实例的
  constructor(vm, fn) {
    this.id = id++
    this.getter = fn // getter 意味着调用这个函数可以发生取值操作

    this.depsIdSet = new Set()
    this.deps = [] //用于记录对应的 dep，后续我们实现计算属性和一些清理工作需要用到
    // 初始化时候调用一次，保证 vm 上的属性取值触发
    this.get()
  }

  get() {
    // Dep.target = this;
    // this.getter(); // 这里会在 vm 上取值
    // Dep.target = null; // 渲染完毕后就清空
    // -------------
    // 这里改为：维护为一个队列，

    pushTarget(this)
    this.getter()
    popTarget()
  }

  addDep(dep) {
    // 一个组件对应着多个属性，重复的属性也不用记录
    const depId = dep.id
    if (!this.depsIdSet.has(depId)) {
      this.deps.push(dep)
      this.depsIdSet.add(depId)
      // watcher 已经记住了 dep 了而且已经去重了，此时让 dep 也记住 watcher
      dep.addSub(this)
    }
  }

  update() {
    // this.get(); // 重新更新渲染
    // 下面开始做异步更新操作，那么就不能立即执行，我们用一个队列把函数暂存起啦
    queueWatcher(this) // 把当前的 watcher 进行暂存
  }

  run() {
    this.get()
  }
}

let queue = []
let has = {}
let pending = false // 防抖
function queueWatcher(watcher) {
  const watcherId = watcher.id
  if (!has[watcherId]) {
    // 如果当前队列中没有当前 watcherId 就存入
    queue.push(watcher)
    has[watcherId] = true
    // 不管我们的 update 执行多少次，但是最终只执行一次刷新操作
    if (!pending) {
      nextTick(flushSchedulerQueue)
      pending = true
    }
  }
}

function flushSchedulerQueue() {
  console.log('这里执行重新渲染操作------------------')
  const newQueue = queue.slice()
  queue.length = 0
  queue = []
  has = {}
  pending = false
  for (let i = 0; i < newQueue.length; i++) {
    newQueue[i].run() // 在刷新的国策还给你中可能还有还有新的 watcher，重新翻到 queue 中
  }
}

let callbacks = []
let waiting = false
function flushCallbacks() {
  const cbs = callbacks.slice()
  waiting = false
  callbacks = []
  cbs.forEach((callback) => callback()) // 按照顺序执行
}

// nextTick 中没有直接使用某个 api，而是采用了优雅降级的方式
// 内部先采用的是 promise（IE 不兼容）
// 然后采用 MutationObserver（h5的 api）
// 然后在考虑 IE 专享 setIMediate
// 然后再使用 setTimeout

let timerFunction
if (Promise) {
  timerFunction = () => {
    Promise.resolve().then(flushCallbacks)
  }
} else if (MutationObserver) {
  timerFunction = () => {
    let observer = new MutationObserver(flushCallbacks)
    // 这里传入的回调是异步执行的
    const textNode = document.createTextNode(1)
    observer.observe(textNode, {
      characterData: true,
    })
    timerFunction = () => {
      textNode.textContent = 2
    }
  }
} else if (setImmediate) {
  timerFunction = () => {
    setImmediate(flushCallbacks)
  }
} else {
  timerFunction = () => {
    setTimeout(flushCallbacks)
  }
}

export function nextTick(cb) {
  callbacks.push(cb) // 维护 nextTick中的 callback
  if (!waiting) {
    timerFunction()
    // vue3已经不兼容 ie 直接使用 promise
    // Promise.resolve().then(flushCallbacks); // vue3的写法
    waiting = true
  }
}


// 需要给可以个属性增加一个 dep，目的就是收集 watcher
// 一个组价视图中有多个属性（n 个属性会对应一个视图)）,n 个 dep 对应一个 watcher
// 1 个属性对应多个视图, 1个 dep 对应多个 watcher
// 多对多的关系


