/**
 * lodash 按需打包插件
 * 将import { xxx } from 'lodash' 编译为 import xxx from 'lodash/xxx'
 * 
 * 代码流程：
 * 1、判断import的source是否与参数一致
 * 2、若一致，判断是否是默认导入
 * 3、如果不是默认导入，遍历批量导入，生成按需引入语句，替换原import语句
 * 
 * 知识点总结：
 * 1、可通过节点处理函数的第二个参数state，state.opts拿到插件的入参
 * 2、path.replaceWithMultiple 批量替换节点
 */
const core = require('@babel/core')

const sourceCode = `
import { debounce, assign, push } from 'lodash'
// import lodash from 'lodash'
`

function importPlugin({ types: t }) {

  return {
    visitor: {
      ImportDeclaration: function(path, state) {
        const source = path.node.source.value
        // state.opts 获取参数
        if (state.opts.libraryName === 'lodash') {

          const specifiers = []
          const defaultSpecifiers = []
          path.node.specifiers.forEach((item) => {
            if (t.isImportSpecifier(item)) {
              specifiers.push(item)
            }
            if (t.isImportDefaultSpecifier(item)) {
              defaultSpecifiers.push(item)
            }
          })
  
          if (defaultSpecifiers.length === 0 && specifiers.length !== 0) {

            const declarations = specifiers.map((specifier) => {
              return t.importDeclaration(
                [t.importDefaultSpecifier(specifier.local)],
                t.stringLiteral(`${source}/${specifier.imported.name}`)
              )
            })

            path.replaceWithMultiple(declarations)
          }
        }

      } 
    }
  }

}

const { code: transformedCode } = core.transform(sourceCode, {
  plugins: [
    [
      importPlugin,
      {
        libraryName: 'lodash'
      }
    ]
  ]
})

console.log(transformedCode)