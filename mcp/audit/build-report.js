/**
 * Builds structured audit reports from documentable symbols.
 * @module mcp/audit/build-report
 */
import { evaluateDocumentable } from './rules/completeness.js'

/**
 * @typedef {Object} SymbolResult
 * @property {string} symbol - Symbol name.
 * @property {'function' | 'class' | 'method' | 'constructor'} kind - Symbol kind.
 * @property {number} line - 1-based source line.
 * @property {'pass' | 'fail'} status - Compliance status.
 * @property {string[]} missing - Missing requirement messages.
 * @property {string[]} ruleIds - Failed rule identifiers.
 */

/**
 * @typedef {Object} AuditReport
 * @property {string} file - Audited file path.
 * @property {{ total: number, pass: number, fail: number }} summary - Score summary.
 * @property {SymbolResult[]} results - Per-symbol compliance rows.
 */

/**
 * @param {string} filePath - Audited file path.
 * @param {import('./extract-documentables.js').Documentable[]} documentables - Extracted symbols.
 * @returns {AuditReport} Structured compliance report.
 */
export function buildReport(filePath, documentables) {
  const results = documentables.map((documentable) => {
    const findings = evaluateDocumentable(documentable)
    const missing = findings.map((finding) => finding.message)
    const ruleIds = findings.map((finding) => finding.ruleId)

    return {
      symbol: documentable.name,
      kind: documentable.kind,
      line: documentable.line,
      status: findings.length === 0 ? 'pass' : 'fail',
      missing,
      ruleIds,
    }
  })

  const pass = results.filter((result) => result.status === 'pass').length

  return {
    file: filePath,
    summary: {
      total: results.length,
      pass,
      fail: results.length - pass,
    },
    results,
  }
}

/**
 * @param {AuditReport} report - Structured audit report.
 * @returns {string} Markdown table matching the spec-compliance skill format.
 */
export function formatReportTable(report) {
  const header = '| Element | Status | Missing Requirements |'
  const divider = '|---------|--------|----------------------|'
  const rows = report.results.map((result) => {
    const status = result.status === 'pass' ? 'Verified' : 'Incomplete'
    const missing = result.missing.length ? result.missing.join('; ') : 'None'
    return `| ${result.symbol} | ${status} | ${missing} |`
  })

  return [header, divider, ...rows].join('\n')
}
