# learn-vue-code-zf

学习vue源码

## 01- rollup 初始化

```bash
mkdir "vue2-stage"
pnpm init -y
pnpm install rollup @rollup/plugin-babel @babel/core @babel/preset-env --save-dev

```

新建 rollup.config.js

```javascript
// rollup 默认可以导出一个对象，作为打包的配置文件
import babel from 'rollup-plugin-babel'

export default {
  input: './src/index.ts', // 入口
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
```

src/index.ts

```javascript
export const a = 100
export const b = 200

export default {Vue: 1}
```

.babelrc

```json
{
  "presets": [
    "@babel/preset-env"
  ]
}
```

package.json

```json
{
  "name": "vue2-stage",
  "version": "1.0.0",
  "description": "",
  "main": "index.ts",
  "scripts": {
    "dev": "rollup -c rollup.config.js -w"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "@babel/core": "^7.25.2",
    "@babel/preset-env": "^7.25.4",
    "rollup": "^2.79.1",
    "rollup-plugin-babel": "^4.4.0"
  }
}
```

pnpm run dev 后可以看到 dist 目录了

## Vue.component

* Vue.component 的作用就是收集全局定义 id 和对应的 definition
* Vue.options.components[id] = definition
* Vue.options.components[组件名 = 定义
* Vue.extend 返回一个子类，而且会在子类上记录自己的选项，
* 面试题：为什么 vue 组件中的 data 不能是一个对象呢？？？
    * 会共享数据，导致相互更改

```javascript
// 如果是对象
function extend(选项) {
  function Sub() {
    this._init() // 子组件的初始化
  }

  Sub.options = 选项
  return Sub
}

let sub = Vue.extend({data: 数据源})
new Sub()
- 会执行
mergeOptions(Sub.options)
Sub.options.data // 如果 data 是一个对象，就是共享的

new Sub()
- 会执行
mergeOptions(Sub.options)

// 这里修改 Sub.options.data中的属性时候，也会影响上面的数据
```

* 创建子类的构造函数的时候，会将全局的组件和自己身上定义的组件进行合并（组件的合并 会先查找自己，找不到，再查找全局的）
* 组件的渲染 开始渲染组件会编译 组件的模板变成 render 函数 => 调用 render 方法
* createElementVNode 会根据 tag 类型来区分是否是自定义组件，如果是，就会创造组件的虚拟节点（自定义组件增加 _init 钩子方法，增加
  componentOptions 选项 { Ctor }） 稍后创建组件的真实节点，我们只需要 new cTor() 即可
* 创建真实节点，也是要区分是组件还是元素节点