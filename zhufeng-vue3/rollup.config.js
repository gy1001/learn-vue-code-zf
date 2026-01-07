// rollup 的配置
// 根据环境变量中的 target 属性，获取对应模块中的 package.json
import path from 'path'
import json from '@rollup/plugin-json'
import ts from 'rollup-plugin-typescript2'
import {nodeResolve} from '@rollup/plugin-node-resolve'
import {fileURLToPath} from 'node:url'
import {promises as fsPromises} from 'node:fs'

// 获取当前模块的文件名（包含完整路径）
const __filename = fileURLToPath(import.meta.url)
// 获取当前模块所在的目录路径，类似于 __dirname
const __dirname = path.dirname(__filename)
// 找到 packages
const packagesDir = path.resolve(__dirname, 'packages')

// packageDir 打包的基准目录
const name = process.env.TARGET
// 找到 要打包的某个包
const packageDir = path.resolve(packagesDir, name)
// 永远针对的就是某个模块
const resolvePackageDir = (p) => path.resolve(packageDir, p)

let pkg = await fsPromises.readFile(resolvePackageDir('package.json'), 'utf8')
pkg = JSON.parse(pkg)

// console.log(pkg);
// 对打包类型，先做一个映射表，根据你提供的 formats 来格式化需要打包的内容
const outputConfig = {
  'esm-bundler': {
    file: resolvePackageDir(`dist/${name}.esm-bundler.js`),
    format: 'esm',
  },
  cjs: {
    file: resolvePackageDir(`dist/${name}.cjs.js`),
    format: 'cjs',
  },
  global: {
    file: resolvePackageDir(`dist/${name}.global.js`),
    format: 'iife', // 立即执行函数
  },
}

const options = pkg.buildOptions // 自己在 package.json中定义的选项

function createConfig(format, output) {
  output.name = options.name
  output.sourcemap = true // 生成 sourcemap
  // 生成 rollup 配置

  return {
    input: resolvePackageDir('src/index.ts'),
    output,
    plugins: [
      json(),
      ts({
        // ts 插件
        tsconfig: path.resolve(__dirname, 'tsconfig.json'),
      }),
      nodeResolve(), //  解析第三方模块
    ],
  }
}

export default options.formats.map((format) => {
  return createConfig(format, outputConfig[format])
})
