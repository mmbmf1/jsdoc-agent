/**
 * Parses JavaScript and TypeScript source into a Babel AST.
 * @module mcp/audit/parse-source
 */
import { parse } from '@babel/parser'

/**
 * @param {string} content - Source file contents.
 * @param {string} filename - File path used to choose the parser mode.
 * @returns {import('@babel/types').File} Parsed AST root.
 */
export function parseSource(content, filename) {
  const isTypeScript = filename.endsWith('.ts')

  return parse(content, {
    sourceType: 'module',
    allowReturnOutsideFunction: true,
    plugins: isTypeScript ? ['typescript'] : [],
  })
}
