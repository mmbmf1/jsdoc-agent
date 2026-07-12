/**
 * Entry point for deterministic JSDoc auditing.
 * @module mcp/audit
 */
import fs from 'fs/promises'
import path from 'path'
import { parseSource } from './parse-source.js'
import { extractDocumentables } from './extract-documentables.js'
import { buildReport, formatReportTable } from './build-report.js'

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

/**
 * Audits a source file against docs-completeness rules.
 * @param {string} filePath - Absolute path to a `.js` or `.ts` file.
 * @returns {Promise<import('./build-report.js').AuditReport>} Structured compliance report.
 */
export async function auditFile(filePath) {
  const documentables = await listDocumentables(filePath)
  return buildReport(filePath, documentables)
}

export { parseSource } from './parse-source.js'
export {
  extractDocumentables,
  extractParamNames,
  detectMayThrow,
} from './extract-documentables.js'
export { getJSDocComment, parseJSDocBlock, getParsedJSDoc } from './parse-jsdoc.js'
export { buildReport, formatReportTable } from './build-report.js'
export { formatHybridAuditResponse, buildFixSuggestionPrompt } from './format-response.js'
export { evaluateDocumentable } from './rules/completeness.js'
