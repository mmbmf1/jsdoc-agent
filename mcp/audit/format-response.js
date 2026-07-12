/**
 * Formats hybrid MCP audit responses for jsdoc_audit.
 * @module mcp/audit/format-response
 */
import { formatReportTable } from './build-report.js'

/**
 * @param {import('./build-report.js').AuditReport} report - Structured audit report.
 * @param {import('./build-report.js').SymbolResult[]} failures - Failed symbol rows.
 * @returns {string} Prompt appendix for LLM fix suggestions.
 */
export function buildFixSuggestionPrompt(failures) {
  const lines = failures.map((failure) => {
    return `- ${failure.symbol} (line ${failure.line}, ${failure.kind}): ${failure.missing.join('; ')}`
  })

  return [
    'The deterministic audit flagged the following symbols.',
    'Suggest exact JSDoc snippets for these items only.',
    'Do not re-score compliance.',
    '',
    ...lines,
  ].join('\n')
}

/**
 * @param {import('./build-report.js').AuditReport} report - Structured audit report.
 * @param {string} ruleContent - Completeness rule markdown.
 * @param {string} skillContent - Audit workflow markdown.
 * @param {boolean} suggestFixes - Whether to include LLM fix guidance.
 * @returns {string} Hybrid MCP tool response text.
 */
export function formatHybridAuditResponse(
  report,
  ruleContent,
  skillContent,
  suggestFixes
) {
  const failures = report.results.filter((result) => result.status === 'fail')
  const sections = [
    '--- AUDIT REPORT (JSON) ---',
    JSON.stringify(report, null, 2),
    '',
    '--- COMPLIANCE TABLE ---',
    formatReportTable(report),
  ]

  if (suggestFixes && failures.length > 0) {
    sections.push(
      '',
      '--- FIX SUGGESTION CONTEXT ---',
      buildFixSuggestionPrompt(failures),
      '',
      '--- RULE SET ---',
      ruleContent,
      '',
      '--- AUDIT WORKFLOW ---',
      skillContent
    )
  }

  return sections.join('\n')
}
