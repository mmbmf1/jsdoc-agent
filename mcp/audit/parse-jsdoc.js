/**
 * Parses JSDoc block comments into structured tag data.
 * @module mcp/audit/parse-jsdoc
 */
import { parse as parseComment } from 'comment-parser'

/**
 * Finds the nearest leading JSDoc block comment on a node.
 * @param {import('@babel/types').Node | null | undefined} node - AST node to inspect.
 * @returns {import('@babel/parser').CommentBlock | null} JSDoc comment node, if present.
 */
export function getJSDocComment(node) {
  if (!node?.leadingComments?.length) {
    return null
  }

  for (let index = node.leadingComments.length - 1; index >= 0; index -= 1) {
    const comment = node.leadingComments[index]
    if (comment.type === 'CommentBlock' && comment.value.startsWith('*')) {
      return comment
    }
  }

  return null
}

/**
 * @param {import('@babel/parser').CommentBlock} comment - Raw Babel JSDoc comment.
 * @returns {import('comment-parser').Block | null} Parsed JSDoc block.
 */
export function parseJSDocBlock(comment) {
  const source = `/*${comment.value}*/`
  const blocks = parseComment(source)
  return blocks[0] ?? null
}
