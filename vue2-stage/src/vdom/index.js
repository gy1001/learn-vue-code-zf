// 这个样子和ast一样吗？
// ast 做的是语法层面的转换，它描述的是语法本身（可以描述 js css html）
// 这里我们的虚拟 DOM 是描述的 DOM 元素，可以增加一些自定义属性(描述 dom 元素)
function vNode(vm, tag, key, data, children, text) {
  return {
    tag,
    data,
    children,
    text,
    key,
  };
}

// h() _c()
export function createElementVNode(vm, tag, props = {}, ...children) {
  console.log("children", children);
  const key = props?.key;
  delete props?.key;
  return vNode(vm, tag, key, props, children);
}

// _v()
export function createTextVNode(vm, text) {
  return vNode(vm, undefined, undefined, undefined, undefined, text);
}
