// 只针对具体的某个包
import {execa} from 'execa'

// 这里我们先固定声明为打包 reactivity 项目
const target = 'reactivity'

// 我们对目标进行依次打包，并行打包
build(target)

// -w 是监听
async function build(target) {
  await execa('rollup', ['-cw', '--environment', `TARGET:${target}`], {
    stdio: 'inherit', // 当子进程打包的信息共享给父进程
  })
}
