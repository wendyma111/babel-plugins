/**
 * 测试文件：用于测试api
 * 
 * 知识点整理：
 * 1、path.stop(): 中止traverse
 * 2、path.skip(): 中止遍历当前节点的子节点，其余节点继续遍历
 */
const core = require('@babel/core')

const sourceCode = `
import { debounce, assign, push } from 'lodash'
const a = 1
`

function skipOrStop({ types: t }) {
  return {
    visitor: {
      ImportDeclaration: function(path) {
        console.log(path.node.type)
        const source = path.node.source.value
        if (source === 'lodash') {
          // 中止traverse
          path.stop()
          // 中止遍历当前节点的子节点，其余节点继续遍历
          path.skip()
        }

      },
      Identifier(path) {
        /**
         * 当调用path.stop时
         * 打印 
         *  ImportDeclaration
         * 
         * 当调用path.skip时
         * 打印 
         *  ImportDeclaration
         *  Identifier a
         * 
         * 当stop和skip都不调用时
         * 打印
         *  ImportDeclaration
         *  Identifier debounce
         *  Identifier assign
         *  Identifier push
         *  Identifier a
         */
        console.log(path.node.type, path.node.name)
      }
    }
  }
}

const { code: transformedCode } = core.transform(sourceCode, {
  plugins: [skipOrStop]
})

console.log(transformedCode)