// 把 packages 目录下的所有目录都打包

import fs from 'fs'
import {execa} from 'execa' // 开启子进程，进行打包，最终还是使用 rollup

const targets = fs.readdirSync('packages').filter((f) => {
  return fs.statSync(`packages/${f}`).isDirectory()
})
// 对我们的目标进行依次打包，并行打包
// console.log(targets) // [ 'reactivity', 'shared' ]

async function build(target) {
  // rollup -c --environment TARGET:shared
  await execa(
    'rollup',
    ['-c', '--environment', `TARGET:${target}`],
    {stdio: 'inherit'}, // 将子进程打包的信息共享给父进程);
  )
}

function runParallel(targets, iteratorFn) {
  const res = []
  for (const item of targets) {
    const p = iteratorFn(item)
    res.push(p)
  }

  return Promise.all(res)
}

runParallel(targets, build)
