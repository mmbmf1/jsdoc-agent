/**
 * Entry point for deterministic JSDoc auditing.
 * @module mcp/audit
 */
import fs from 'fs/promises'
import path from 'path'
import { parseSource } from './parse-source.js'
import { extractDocumentables } from './extract-documentables.js'

/**
 * Parses a source file and returns documentable symbols with attached JSDoc.
 * @param {string} filePath - Absolute path to a `.js` or `.ts` file.
 * @returns {Promise<import('./extract-documentables.js').Documentable[]>} Extracted symbols.
 */
export async function listDocumentables(filePath) {
  const content = await fs.readFile(filePath, 'utf-8')
  const ast = parseSource(content, path.basename(filePath))
  return extractDocumentables(ast)
}

export { parseSource } from './parse-source.js'
export { extractDocumentables, extractParamNames, detectMayThrow } from './extract-documentables.js'
export { getJSDocComment, parseJSDocBlock, getParsedJSDoc } from './parse-jsdoc.js'
