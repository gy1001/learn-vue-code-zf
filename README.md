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
```

src/index.js
```javascript
export const a = 100
export const b = 200

export default { Vue: 1 }
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
  "main": "index.js",
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
