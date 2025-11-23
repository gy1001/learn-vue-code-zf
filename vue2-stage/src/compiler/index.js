import { defaultTagRE, ELEMENT_TYPE, parseHtml, TEXT_TYPE } from './parse'

function genProps(attrs) {
  let str = '' // {name, value}
  for (let i = 0, len = attrs.length; i < len; i++) {
    let attr = attrs[i]
    if (attr.name === 'style') {
      // color: 'red' => {color: 'red'}
      let obj = {}
      attr.value.split(';').forEach((item) => {
        if (item) {
          let [key, value] = item.split(':')
          obj[key] = value.trim()
        }
      })
      attr.value = obj
    }
    str += `${attr.name}: ${JSON.stringify(attr.value)},`
  }
  return `{${str.slice(0, -1)}}` // 去掉最后一个，
}

function genChild(node) {
  // 如果是文本、元素
  if (node.type === ELEMENT_TYPE) {
    // 是元素
    return codegen(node)
  } else if (node.type === TEXT_TYPE) {
    // 是文本
    const nodeText = node.text
    if (!defaultTagRE.test(nodeText)) {
      // 是不是一个文本
      return `_v(${JSON.stringify(nodeText)})`
    }
    // {{name}} hello {{age}}
    // 需要转变为
    // _v( _s(name) + "hello" + _s(age))
    // _c是创建元素的，_v是创建文本的，_s是 JSON.stringify
    let tokens = []
    let match
    defaultTagRE.lastIndex = 0
    let lastIndex = 0
    while ((match = defaultTagRE.exec(nodeText))) {
      const index = match.index // 匹配的位置
      if (index > lastIndex) {
        tokens.push(JSON.stringify(nodeText.slice(lastIndex, index)))
      }
      tokens.push(`_s(${match[1].trim()})`)
      lastIndex = index + match[0].length
    }
    // 如果匹配完，后面还有文本
    if (lastIndex < nodeText.length) {
      tokens.push(JSON.stringify(nodeText.slice(lastIndex, nodeText.length)))
    }
    return `_v(${tokens.join('+')})`
  }
}

function genChildren(children) {
  return children.map((child) => genChild(child)).join(',')
}

function codegen(ast) {
  const children = genChildren(ast.children)
  let code = `_c('${ast.tag}', ${ast.attrs.length > 0 ? genProps(ast.attrs) : '{}'}, ${ast.children.length ? `${children}` : ''})`
  return code
}

export function compileToFunction(template) {
  // 1. 将 template 转换成 ast语法树木
  let ast = parseHtml(template)
  // 2. 生成 render 方法，render方法的返回结果是虚拟DOM
  let code = codegen(ast)
  // 模板引擎的实现原理就是：with + new Function
  code = `with(this){return ${code}}`
  return new Function(code) // 根据代码生成 render 函数
}
