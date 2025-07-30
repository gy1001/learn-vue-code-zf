// rollup 默认可以导出一个对象，作为打包的配置文件
import babel from '@rollup/plugin-babel'

export default {
  input: './src/index.js', // 入口
  output: {
    file: './dist/vue.js', // 出口
    name: 'Vue', // 表示打包后在全局增加 Vue 变量 global.Vue
    format: 'umd', // esm es6模块 commonjs 模块 iife 自执行函数 umd
    sourcemap: true, // 需要可以调试源代码
  },
  plugins: [
    babel({
      exclude: 'node_modules/**', // 排除 node_modules 所有文件
    }),
  ],
}