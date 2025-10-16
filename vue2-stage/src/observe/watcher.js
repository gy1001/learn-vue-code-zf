import Dep from "./dep.js";
let id = 0;

// 1. 当我们创建渲染 watcher 的时候我们会把当前的渲染 watcher 放到 Dep.target上
// 2. 调用 _render() 会取值，就会走到 get 上

// 每个属性有一个 dep（属性就是被观察者），watcher 就是观察者（属性更新了通知观察者来更新）=> 观察者模式

export class Watcher {
  // 不同组件有不同的 watcher，目前只有一个渲染根实例的
  constructor(vm, fn) {
    this.id = id++;
    this.getter = fn; // getter 意味着调用这个函数可以发生取值操作

    this.depsIdSet = new Set();
    this.deps = []; //用于记录对应的 dep，后续我们实现计算属性和一些清理工作需要用到
    // 初始化时候调用一次，保证 vm 上的属性取值触发
    this.get();
  }

  get() {
    Dep.target = this;
    this.getter(); // 这里会在 vm 上取值
    Dep.target = null; // 渲染完毕后就清空
  }

  addDep(dep) {
    // 一个组件对应着多个属性，重复的属性也不用记录
    const depId = dep.id;
    if (this.depsIdSet.has(depId)) {
      this.deps.push(dep);
      this.depsIdSet.add(depId);
      // watcher 已经记住了 dep 了而且已经去重了，此时让 dep 也记住 watcher
      dep.addSub(this);
    }
  }

  update() {
    this.get(); // 重新更新渲染
  }
}

// 需要给可以个属性增加一个 dep，目的就是收集 watcher
// 一个组价视图中有多个属性（n 个属性会对应一个视图)）,n 个 dep 对应一个 watcher
// 1 个属性对应多个视图, 1个 dep 对应多个 watcher
// 多对多的关系


