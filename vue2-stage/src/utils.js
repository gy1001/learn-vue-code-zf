const strats = {}
const LIFE_CYCLE = ['beforeCreate', 'created', 'beforeMount']
LIFE_CYCLE.forEach((cycle) => {
  // {} {created: function(){} } => {created: [fn]}
  // {created: [fn]} {created: function(){}} => {created: [fn, fn]}
  strats[cycle] = function (p, c) {
    if (c) {
      // 如果儿子有，并且父亲有，让父亲和儿子拼在一起
      if (p) {
        return p.concat(c)
      } else {
        // 对于第一次，只有儿子有，父亲没有, 则将儿子包装成对象
        return [c]
      }
    } else {
      // 如果儿子没有，则用父亲即可
      return p
    }
  }
})

strats.components = function (parentVal, childVal) {
  const result = Object.create(parentVal)
  if (childVal) {
    for (let key in childVal) {
      // 返回的是构造的对象，可以拿到父亲原型上的属性，
      // 并且将儿子的都拷贝到自己身上
      result[key] = childVal[key]
    }
  }

  return result
}

export function mergeOptions(parent, child) {
  console.log(parent, child, 'parent, child')
  function mergeField(key) {
    // 为了避免多次 if，可以采用策略模式
    if (strats[key]) {
      options[key] = strats[key](parent[key], child[key])
    } else {
      // 如果不在策略中
      // 优先采用 child 的，再采用 parent 的
      options[key] = child[key] || parent[key]
    }
  }
  const options = {}
  for (const key in parent) {
    mergeField(key)
  }
  for (const key in child) {
    // 在这里只合并child 中不存在于 parent 的属性
    if (!parent.hasOwnProperty(key)) {
      mergeField(key)
    }
  }

  return options
}
