/**
 * Extracts top-level documentable symbols from a parsed AST.
 * @module mcp/audit/extract-documentables
 */
import { getParsedJSDoc } from './parse-jsdoc.js'

/**
 * @typedef {Object} Documentable
 * @property {string} name - Human-readable symbol name.
 * @property {'function' | 'class' | 'method' | 'constructor'} kind - Symbol category.
 * @property {number} line - 1-based source line.
 * @property {string[]} params - Expected parameter names from the signature.
 * @property {import('comment-parser').Block | null} jsdoc - Parsed JSDoc block, if any.
 * @property {boolean} requiresThrowsTag - Whether a @throws tag is required by heuristics.
 */

/**
 * Collects parameter names from a function parameter list.
 * @param {import('@babel/types').Function['params']} params - Function params array.
 * @returns {string[]} Parameter names, including simple destructured keys.
 */
export function extractParamNames(params) {
  /** @type {string[]} */
  const names = []

  for (const param of params) {
    collectParamNames(param, names)
  }

  return names
}

/**
 * @param {import('@babel/types').Node} param - Parameter node.
 * @param {string[]} names - Accumulator for discovered names.
 */
function collectParamNames(param, names) {
  switch (param.type) {
    case 'Identifier':
      names.push(param.name)
      break
    case 'AssignmentPattern':
      collectParamNames(param.left, names)
      break
    case 'RestElement':
      collectParamNames(param.argument, names)
      break
    case 'ObjectPattern':
      for (const property of param.properties) {
        if (property.type === 'RestElement') {
          collectParamNames(property.argument, names)
        } else if (
          property.type === 'ObjectProperty' &&
          property.key.type === 'Identifier'
        ) {
          names.push(property.key.name)
        }
      }
      break
    case 'ArrayPattern':
      for (const element of param.elements) {
        if (element) {
          collectParamNames(element, names)
        }
      }
      break
    default:
      break
  }
}

/**
 * Detects operations that can fail and require a `@throws` tag.
 * @param {import('@babel/types').Node | null | undefined} body - Function or method body.
 * @returns {boolean} True when heuristics suggest `@throws` is required.
 */
export function detectThrowsRequirement(body) {
  if (!body) {
    return false
  }

  /** @type {boolean} */
  let requiresThrowsTag = false

  walkNode(body, (node) => {
    if (requiresThrowsTag) {
      return
    }

    if (node.type === 'ThrowStatement') {
      requiresThrowsTag = true
      return
    }

    if (node.type === 'AwaitExpression') {
      requiresThrowsTag = true
      return
    }

    if (
      node.type === 'CallExpression' &&
      node.callee.type === 'MemberExpression' &&
      node.callee.property.type === 'Identifier' &&
      node.callee.property.name === 'reject'
    ) {
      requiresThrowsTag = true
    }
  })

  return requiresThrowsTag
}

/**
 * @param {import('@babel/types').Node} node - AST subtree root.
 * @param {(node: import('@babel/types').Node) => void} visit - Visitor callback.
 */
function walkNode(node, visit) {
  visit(node)

  for (const key of Object.keys(node)) {
    if (key === 'loc' || key === 'start' || key === 'end') {
      continue
    }

    const value = node[key]
    if (!value) {
      continue
    }

    if (Array.isArray(value)) {
      for (const child of value) {
        if (child && typeof child.type === 'string') {
          walkNode(child, visit)
        }
      }
    } else if (typeof value.type === 'string') {
      walkNode(value, visit)
    }
  }
}

/**
 * @param {import('@babel/types').File} ast - Parsed source file.
 * @returns {Documentable[]} Documentable symbols found at program scope.
 */
export function extractDocumentables(ast) {
  /** @type {Documentable[]} */
  const documentables = []

  for (const statement of ast.program.body) {
    collectFromStatement(statement, documentables)
  }

  return documentables
}

/**
 * @param {import('@babel/types').Statement} statement - Program body statement.
 * @param {Documentable[]} documentables - Output collection.
 */
function collectFromStatement(statement, documentables) {
  if (
    statement.type === 'ExportNamedDeclaration' ||
    statement.type === 'ExportDefaultDeclaration'
  ) {
    if (statement.declaration) {
      collectFromDeclaration(statement, statement.declaration, documentables)
    }
    return
  }

  collectFromDeclaration(null, statement, documentables)
}

/**
 * @param {import('@babel/types').Node | null} outerNode - Export wrapper node.
 * @param {import('@babel/types').Node} declaration - Declared node.
 * @param {Documentable[]} documentables - Output collection.
 */
function collectFromDeclaration(outerNode, declaration, documentables) {
  switch (declaration.type) {
    case 'FunctionDeclaration':
      addFunctionDocumentable(
        outerNode,
        declaration,
        declaration.id?.name ?? 'default',
        'function',
        documentables
      )
      break
    case 'ClassDeclaration':
      addClassDocumentables(outerNode, declaration, documentables)
      break
    case 'VariableDeclaration':
      for (const declarator of declaration.declarations) {
        addVariableDocumentable(outerNode, declarator, documentables)
      }
      break
    default:
      break
  }
}

/**
 * @param {import('@babel/types').Node | null} outerNode - Export wrapper node.
 * @param {import('@babel/types').VariableDeclarator} declarator - Variable declarator.
 * @param {Documentable[]} documentables - Output collection.
 */
function addVariableDocumentable(outerNode, declarator, documentables) {
  if (
    declarator.id.type !== 'Identifier' ||
    !declarator.init ||
    (declarator.init.type !== 'FunctionExpression' &&
      declarator.init.type !== 'ArrowFunctionExpression')
  ) {
    return
  }

  addFunctionDocumentable(
    outerNode,
    declarator.init,
    declarator.id.name,
    'function',
    documentables
  )
}

/**
 * @param {import('@babel/types').Node | null} outerNode - Export wrapper node.
 * @param {import('@babel/types').ClassDeclaration} classNode - Class declaration.
 * @param {Documentable[]} documentables - Output collection.
 */
function addClassDocumentables(outerNode, classNode, documentables) {
  const className = classNode.id?.name ?? 'default'

  documentables.push({
    name: className,
    kind: 'class',
    line: classNode.loc?.start.line ?? 1,
    params: [],
    jsdoc: getParsedJSDoc(outerNode, classNode),
    requiresThrowsTag: false,
  })

  for (const member of classNode.body.body) {
    if (member.type !== 'ClassMethod' && member.type !== 'ClassPrivateMethod') {
      continue
    }

    if (member.type === 'ClassPrivateMethod') {
      continue
    }

    if (member.key.type !== 'Identifier') {
      continue
    }

    const methodName = member.key.name
    const kind = member.kind === 'constructor' ? 'constructor' : 'method'
    const displayName =
      kind === 'constructor'
        ? `${className}.constructor`
        : `${className}.${methodName}`

    documentables.push({
      name: displayName,
      kind,
      line: member.loc?.start.line ?? 1,
      params: extractParamNames(member.params),
      jsdoc: getParsedJSDoc(null, member),
      requiresThrowsTag: detectThrowsRequirement(member.body),
    })
  }
}

/**
 * @param {import('@babel/types').Node | null} outerNode - Export wrapper node.
 * @param {import('@babel/types').Function} functionNode - Function-like node.
 * @param {string} name - Symbol name.
 * @param {'function'} kind - Symbol kind.
 * @param {Documentable[]} documentables - Output collection.
 */
function addFunctionDocumentable(
  outerNode,
  functionNode,
  name,
  kind,
  documentables
) {
  documentables.push({
    name,
    kind,
    line: functionNode.loc?.start.line ?? 1,
    params: extractParamNames(functionNode.params),
    jsdoc: getParsedJSDoc(outerNode, functionNode),
    requiresThrowsTag: detectThrowsRequirement(functionNode.body),
  })
}
