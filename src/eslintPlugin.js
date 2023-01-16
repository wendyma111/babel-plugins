/**
 * 实现简易版eslintPlugin - noconsole，禁止使用console
 * 
 * 知识点整理：
 * 1、babel提供了遍历的生命周期钩子，pre：遍历之前调用；post：遍历之后调用
 * 2、pre/post接收file参数，可以通过file.set(key, value)和file.get(key)实现数据传递
 * 3、path.buildCodeFrameError：生成代码错误
 * 4、path.parentPath.remove(): 移除当前节点
 */ 

const core = require('@babel/core')

const sourceCode = `
  const a = 1
  console.log(a)
  const b = 2
  console.log(b)
`

/**
 * @param fix 是否自动修复
 */
const eslintPlugin = function(fix) {
  return function({ types: t }) {
    return {
      pre(file) {
        file.set('errors', [])
      },
      visitor: {
        CallExpression(path, state) {
          if(path.node.callee.object.name === 'console' && path.node.callee.property.name === 'log') {
            
            state.file.get('errors').push(
              path.buildCodeFrameError('禁止调用console')
            )
            
            // 自动修复，则将console直接移除
            if (fix === true) {
              path.parentPath.remove()
            }
          }
        }
      },
      post(file) {
        console.log(...file.get("errors"));
      }
    }
  }
}

const { code: transformedCode } = core.transform(sourceCode, {
  plugins: [eslintPlugin(true)]
})

console.log(transformedCode)