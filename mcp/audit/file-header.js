/**
 * Checks whether a source file has a file-level JSDoc description.
 * @module mcp/audit/file-header
 */
import { parseSource } from './parse-source.js'
import { getJSDocComment, parseJSDocBlock } from './parse-jsdoc.js'

/**
 * @param {import('@babel/types').Statement} statement - Program statement.
 * @returns {boolean} True when the statement has a described JSDoc block.
 */
function statementHasDescribedJSDoc(statement) {
  const comment = getJSDocComment(statement)
  if (!comment) {
    return false
  }

  const parsed = parseJSDocBlock(comment)
  if (!parsed) {
    return false
  }

  if (parsed.description?.trim()) {
    return true
  }

  return (parsed.tags ?? []).some(
    (tag) =>
      (tag.tag === 'description' || tag.tag === 'module') &&
      tag.description?.trim()
  )
}

/**
 * Determines whether a file begins with a JSDoc block containing a description.
 * @param {string} content - Raw source file contents.
 * @param {string} filename - File name used for parser mode selection.
 * @returns {boolean} True when a file-level JSDoc description is present.
 */
export function hasFileLevelJSDoc(content, filename) {
  const ast = parseSource(content, filename)

  for (const statement of ast.program.body.slice(0, 3)) {
    if (statementHasDescribedJSDoc(statement)) {
      return true
    }
  }

  return false
}
