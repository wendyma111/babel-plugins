module.exports = function importPlugin({ types: t }) {

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