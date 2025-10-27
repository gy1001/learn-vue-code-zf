let uid = 0

class Dep {
  constructor() {
    this.id = uid++ // 属性的 dep 要收集 watcher
    this.subs = [] // 这里面存放着当前属性对应的 watcher
  }

  depend() {
    // 这里我们不需要放置重复的 watcher，而且这里还只是一个单向的关系：dep->watcher
    // 其实 还需要双向：watcher -> dep: 比如组件卸载时候，需要删除对应的渲染函数
    // 这里本来可以直接塞入，但是为了双向记录并且去重，所以不能简单的 push，需要绕一圈
    // this.subs.push(Dep.target); ----> 简单这样写，不能去重
    if (Dep.target) {
      Dep.target.addDep(this) // 让 watcher 记住 dep
    }
  }

  addSub(watcher) {
    this.subs.push(watcher)
  }

  notify() {
    this.subs.forEach((watcher) => {
      watcher.update()
    })
  }
}

Dep.target = null

let stack = []
export function pushTarget(watcher) {
  stack.push(watcher)
  Dep.target = watcher
}

export function popTarget(watcher) {
  stack.pop()
  Dep.target = stack[stack.length - 1]
}

export default Dep
