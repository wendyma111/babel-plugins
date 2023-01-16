/**
 * 自定义console.log插件，在打印的同时，将代码位置和文件也打印出来
 * 
 * 代码逻辑：
 * 1、遍历CallExpression节点，如果是console.log，在arguments中推入代码位置和文件名称
 * 
 * 知识点整理：
 * 1、t.stringLiteral(string): 生成string类型字面量
 * 2、path.node.loc：记录代码位置，包括行、列信息
 */

const core = require('@babel/core')

const sourceCode = 'console.log()'

const consolePlugin = function({ types: t }) {
  return {
    visitor: {
      CallExpression: function(path) {
        if (
            path.node.callee.object.name === 'console' &&
            path.node.callee.property.name === 'log'
          ) {
            path.node.arguments.push(
              t.stringLiteral(JSON.stringify(path.node.loc)),
              t.stringLiteral(__filename)
            )
        }
      }
    }
  }
}

const { code: transformedCode } = core.transform(sourceCode, {
  plugins: [consolePlugin]
})

eval(transformedCode)