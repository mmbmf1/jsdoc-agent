/**
 * Evaluates documentable symbols against structural JSDoc completeness rules.
 * @module mcp/audit/evaluate-compliance
 */

/**
 * @typedef {Object} ComplianceResult
 * @property {string} name - Symbol name.
 * @property {import('./extract-documentables.js').Documentable['kind']} kind - Symbol kind.
 * @property {number} line - 1-based source line.
 * @property {'structurally_complete' | 'incomplete'} status - Structural compliance status.
 * @property {string[]} missing - Missing or invalid requirements.
 */

/**
 * @typedef {Object} ComplianceReport
 * @property {ComplianceResult[]} results - Per-symbol results.
 * @property {{ total: number, structurallyComplete: number, incomplete: number }} summary - Counts.
 */

/**
 * @param {import('comment-parser').Block | null | undefined} jsdoc - Parsed JSDoc block.
 * @returns {boolean} True when a non-empty description is present.
 */
function hasDescription(jsdoc) {
  if (!jsdoc) {
    return false
  }

  if (jsdoc.description?.trim()) {
    return true
  }

  return (jsdoc.tags ?? []).some(
    (tag) => tag.tag === 'description' && tag.description?.trim()
  )
}

/**
 * @param {import('comment-parser').Tag} tag - Parsed tag.
 * @returns {boolean} True when the tag has a type and description.
 */
function tagHasTypeAndDescription(tag) {
  return Boolean(tag.type?.trim() && tag.description?.trim())
}

/**
 * @param {import('comment-parser').Block | null | undefined} jsdoc - Parsed JSDoc block.
 * @param {string} paramName - Expected parameter name.
 * @returns {boolean} True when a valid @param tag exists for the name.
 */
function hasValidParamTag(jsdoc, paramName) {
  if (!jsdoc?.tags) {
    return false
  }

  return jsdoc.tags.some(
    (tag) =>
      tag.tag === 'param' &&
      tag.name === paramName &&
      tagHasTypeAndDescription(tag)
  )
}

/**
 * @param {import('comment-parser').Block | null | undefined} jsdoc - Parsed JSDoc block.
 * @returns {boolean} True when a valid @returns tag is present.
 */
function hasValidReturnsTag(jsdoc) {
  if (!jsdoc?.tags) {
    return false
  }

  return jsdoc.tags.some(
    (tag) =>
      (tag.tag === 'returns' || tag.tag === 'return') &&
      tagHasTypeAndDescription(tag)
  )
}

/**
 * @param {import('comment-parser').Block | null | undefined} jsdoc - Parsed JSDoc block.
 * @returns {boolean} True when at least one valid @throws tag is present.
 */
function hasValidThrowsTag(jsdoc) {
  if (!jsdoc?.tags) {
    return false
  }

  return jsdoc.tags.some(
    (tag) =>
      tag.tag === 'throws' &&
      (tag.type?.trim() || tag.name?.trim()) &&
      tag.description?.trim()
  )
}

/**
 * @param {import('./extract-documentables.js').Documentable} documentable - Symbol to evaluate.
 * @returns {string[]} Missing or invalid structural requirements.
 */
function collectMissingRequirements(documentable) {
  /** @type {string[]} */
  const missing = []
  const { kind, params, jsdoc, requiresThrowsTag } = documentable

  if (!hasDescription(jsdoc)) {
    missing.push('description')
  }

  if (kind === 'class') {
    return missing
  }

  for (const paramName of params) {
    if (!hasValidParamTag(jsdoc, paramName)) {
      missing.push(`@param: ${paramName}`)
    }
  }

  if (kind !== 'constructor' && !hasValidReturnsTag(jsdoc)) {
    missing.push('@returns')
  }

  if (requiresThrowsTag && !hasValidThrowsTag(jsdoc)) {
    missing.push('@throws')
  }

  return missing
}

/**
 * @param {import('./extract-documentables.js').Documentable} documentable - Symbol to evaluate.
 * @returns {ComplianceResult} Structural compliance result for one symbol.
 */
function evaluateDocumentable(documentable) {
  const missing = collectMissingRequirements(documentable)

  return {
    name: documentable.name,
    kind: documentable.kind,
    line: documentable.line,
    status: missing.length === 0 ? 'structurally_complete' : 'incomplete',
    missing,
  }
}

/**
 * @param {import('./extract-documentables.js').Documentable[]} documentables - Symbols to evaluate.
 * @returns {ComplianceReport} Structural compliance report.
 */
export function evaluateCompliance(documentables) {
  const results = documentables.map(evaluateDocumentable)
  const structurallyComplete = results.filter(
    (result) => result.status === 'structurally_complete'
  ).length

  return {
    results,
    summary: {
      total: results.length,
      structurallyComplete,
      incomplete: results.length - structurallyComplete,
    },
  }
}
