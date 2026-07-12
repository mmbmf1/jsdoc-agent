/**
 * Formats deterministic audit output for MCP clients.
 * @module mcp/format-audit-response
 */

/**
 * @param {import('./audit/evaluate-compliance.js').ComplianceReport} report - Compliance report.
 * @returns {string} Markdown table of structural audit results.
 */
export function formatStructuralAuditTable(report) {
  const lines = [
    '| Element | Status | Missing Requirements |',
    '| --- | --- | --- |',
  ]

  for (const result of report.results) {
    const statusLabel =
      result.status === 'structurally_complete'
        ? 'Structurally complete'
        : 'Incomplete'
    const missing =
      result.missing.length > 0 ? result.missing.join(', ') : '—'

    lines.push(`| ${result.name} | ${statusLabel} | ${missing} |`)
  }

  lines.push('')
  lines.push(
    `Summary: ${report.summary.structurallyComplete}/${report.summary.total} structurally complete, ${report.summary.incomplete} incomplete.`
  )

  return lines.join('\n')
}

/**
 * @param {import('./audit/evaluate-compliance.js').ComplianceReport} report - Compliance report.
 * @param {string} rules - Completeness rules Markdown.
 * @param {string} contentSpecs - Concatenated content spec Markdown.
 * @param {string} skill - Audit workflow Markdown.
 * @param {string} source - Target source file contents.
 * @returns {string} Layered MCP audit response.
 */
export function formatAuditResponse(report, rules, contentSpecs, skill, source) {
  const structuralAudit = formatStructuralAuditTable(report)

  return [
    '--- STRUCTURAL AUDIT ---',
    structuralAudit,
    '--- RULE SET ---',
    rules,
    '--- CONTENT SPECS ---',
    contentSpecs,
    '--- AUDIT WORKFLOW ---',
    skill,
    '--- TARGET CODE ---',
    source,
    'Present the Structural Audit table as-is. For Incomplete rows, suggest JSDoc snippets using the Content Specs and Rule Set above.',
  ].join('\n')
}
