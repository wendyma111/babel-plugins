/**
 * 函数调用时上传日志
 * 
 * 代码逻辑：
 * 1、处理Program节点
 * 2、traverse Program节点，检查是否是Function，若是，则插入logger()
 * 3、遍历ImportDeclaration，判断是否有引入logger，如果没有，则插入import logger from 'logger'
 */

const core = require('@babel/core')

const sourceCode = `
function test() {}
const a = () => {}
`
const loggerPlugin = function({ types: t }) {

  return {
    visitor: {
      Program(path) {
        // 当前模块是否有引入
        let ifImportLogger = false

        path.traverse({
          enter(path) {
            if (t.isFunction(path)) {
              // 在函数体内加入logger调用方法
              if (t.isBlockStatement(path.node.body)) {
                path.node.body.body.push(t.expressionStatement(t.callExpression(t.identifier('logger'), [])))
              }
            }
          },
          ImportDeclaration(path) {
            if (path.node.source.value === 'logger') {
              ifImportLogger = true
            }
          }
        })

        if (ifImportLogger === false) {
          // 插入import logger from 'logger'
          path.node.body.unshift(
            t.importDeclaration(
              [t.importDefaultSpecifier(t.identifier('logger'))],
              t.stringLiteral('logger')
            )
          )
        }
      }
    }
  }
}

const { code: transformedCode } = core.transform(sourceCode, {
  plugins: [loggerPlugin]
})

console.log(transformedCode)
/**
 * 输出
 * import logger from "logger";
   function test() {
    logger();
   }
   const a = () => {
     logger();
   };
 */