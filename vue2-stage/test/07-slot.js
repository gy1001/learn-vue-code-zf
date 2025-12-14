const templateCompiler = require('vue-template-compiler')

let result = templateCompiler.compile(`<my><div>{{msg}}</div></my>`)
console.log(result)
// 打印结果如下
retsult = {
  ast: {
    type: 1,
    tag: 'my',
    attrsList: [],
    attrsMap: {},
    rawAttrsMap: {},
    parent: undefined,
    children: [[Object]],
    plain: true,
    static: false,
    staticRoot: false,
  },
  render: "with(this){return _c('my',[_c('div',[_v(_s(msg))])])}",
  staticRenderFns: [],
  errors: [],
  tips: [],
}

// 对于使用插槽的组件呢？》
let result2 = templateCompiler.compile(`<div class="my"><slot></slot></div>`)
console.log(result2)
// result2 的结果如下
result2 = {
  ast: {
    type: 1,
    tag: 'div',
    attrsList: [],
    attrsMap: { class: 'my' },
    rawAttrsMap: {},
    parent: undefined,
    children: [[Object]],
    plain: false,
    staticClass: '"my"',
    static: false,
    staticRoot: false,
  },
  render: `with(this){return _c('div',{staticClass:"my"},[_t("default")],2)}`,
  staticRenderFns: [],
  errors: [],
  tips: [],
}
