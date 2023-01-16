/**
 * 主体功能：手写箭头函数转function插件
 * 1、将箭头函数转换成es5的函数
 * 2、继承父级（非箭头函数）作用域的this
 * 3、兼容箭头函数简写情况 如：() => 1
 * 
 * 代码流程：
 * 1、定义插件函数
 * 2、找到ArrowFunctionExpression，将其替换成FunctionExpression
 * 3、简写情况，为其包裹块级作用域，return返回
 * 4、递归向上查找非箭头函数的函数作用域 / 全局作用域，插入var _this = this
 * 5、查找函数体内的this，替换成_this
 * 
 * 知识点总结：
 * 1、babel插件定义的模板，参数中解构出来的types即@babel/types的导出值，可以验证、生成节点
 * 返回一个函数visitor属性的对象，visitor使用方式类似于traverse的第二个参数，key为节点类型，
 * value为节点处理函数，函数入参path，提供节点替换、删除、查找等方法，通过parentPath指向父级
 *  function({ types }) {
 *    return {
 *      visitor: {
 *        [astNode.type]: function(path){}
 *      }
 *    }
 *  }
 * 2、path上挂载的方法
 *  2-1、path.findParent：函数，接收path参数，path为递归向上的父级path，
 * return布尔值，返回为true时，findParent返回该节点
 *  2-2、path.traverse：遍历path的子节点，传入visitor对象
 *  2-3、path.replaceWith：接收一个ast节点，替换当前节点
 *  2-4、path.scope：通过数组形式存放作用域链
 *  2-5、path.isFunction：是否是函数节点
 *  2-6、path.isArrowFunctionExpression：是否是箭头函数
 *  2-7、path.isProgram：是否是主程序
 * 
 * 3、types方法
 *  3-1、t.identifier(string): 生成Identifier节点，标识名称是传入的字符串
 *  3-2、t.thisExpression(): 生成ThisExpression，无入参
 *  3-3、t.blockStatement(Array<ReturnStatement>): 生成BlockStatement
 *  3-4、t.returnStatement({ argument: ast节点 })：生成ReturnStatement
 *  3-5、t.isBlockStatement(ast节点): 判断是否是BlockStatement
 */

const core = require('@babel/core')

const sourceCode = 'const a = (c, d) => { console.log(this); return 1 }'

const hoistFunctionEnvironment = function(path, types) {
  // 查找非箭头函数的函数作用域 / 全局作用域
  const thisEnv = path.findParent((path) => (
    path.isFunction() && !path.isArrowFunctionExpression()) || path.isProgram()
  )

  //向父作用域内放入一个_this变量
  thisEnv.scope.push({
    id: types.identifier("_this"), //生成标识符节点,也就是变量名
    init: types.thisExpression(), //生成this节点 也就是变量值
  });
}

const arrowFunctionPlugin = function({ types: t }) {
  return {
    visitor: {
      ArrowFunctionExpression: function(path) {
        // 处理箭头函数中的this
        hoistFunctionEnvironment(path, t)

        const body = path.get('body')
        path.node.type = 'FunctionExpression'
        if (!t.isBlockStatement(body)) {
          path.node.body = t.blockStatement([t.returnStatement({ argument: body })])
        }

        // 遍历箭头函数的子节点，替换this
        path.traverse({
          ThisExpression: function(path) {
            path.replaceWith(t.identifier('_this'))
          }
        })
      },
    }
  }
}

const res = core.transform(sourceCode, {
  plugins: [arrowFunctionPlugin]
})

console.log(res.code)