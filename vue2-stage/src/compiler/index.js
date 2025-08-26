const unicodeRegExp =
  /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/;
// unicodeRegExp.source 用于拿到正则表达式 unicodeRegExp 的字符串。

// 第一个分组就是属性的key value就是分组3分组4分组5
const attribute =
  /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
const dynamicArgAttribute =
  /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z${unicodeRegExp.source}]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;

//他匹配到的分组是一个标签名 </xxx 最终匹配到的分组是开始标签名
const startTagOpen = new RegExp(`^<${qnameCapture}`);

const startTagClose = /^\s*(\/?)>/;

// 匹配到的是 </xxx 最终匹配到的分组是结束标签名
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);
const doctype = /^<!DOCTYPE [^>]+>/i;
const comment = /^<!\--/;
const conditionalComment = /^<!\[/;
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

export function compileToFunction(template) {
  // 1. 将 template 转换成 ast语法树木
  let ast = parseHtml(template);
  // 2. 生成 render 方法，render方法的返回结果是虚拟DOM
}

function parseHtml(html) {
  function start(tag, attrs) {
    console.log("start", tag, attrs);
  }

  function end(tag) {
    console.log("end", tag);
  }

  function chars(text) {
    console.log("chars", text);
  }

  function advance(n) {
    html = html.substring(n); // 返回该字符串从起始索引到结束索引（不包括）的部分
  }

  function parseStartTag() {
    const start = html.match(startTagOpen);
    if (start) {
      const match = {
        tagName: start[1],
        attrs: [],
      };
      advance(start[0].length);
      // 如果不是开始标签的结束，就一直匹配下去
      let attr, end;
      while (
        !(end = html.match(startTagClose)) &&
        (attr = html.match(attribute))
      ) {
        advance(attr[0].length);
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5] || true,
        });
      }
      if (end) {
        advance(end[0].length); //
      }

      return match;
    }
    // 不是开始标签
    return false;
  }

  // html 最开始肯定是一个 <
  while (html) {
    let textEnd = html.indexOf("<"); // 如果 indexOf 中的索引是0，则说明是个标签
    // 如果 textEnd 为0，则说明是一个开始标签，或者结束标签
    // 如果 textEnd >0 说明是文本开始的位置
    if (textEnd === 0) {
      const startTagMatch = parseStartTag();
      if (startTagMatch) {
        // 解析到了开始标签
        start(startTagMatch.tagName, startTagMatch.attrs);
        continue;
      }
      let endTagMatch = html.match(endTag);
      if (endTagMatch) {
        advance(endTagMatch[0].length);
        end(endTagMatch[1]);
        continue;
      }
    }
    if (textEnd > 0) {
      // 说明有文本
      let text = html.substring(0, textEnd); // 截取出来文本内容
      if (text) {
        advance(text.length); // 解析到了文本
        chars(text);
      }
    }
  }
}
