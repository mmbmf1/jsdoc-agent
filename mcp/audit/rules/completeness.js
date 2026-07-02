/**
 * Deterministic checks for docs-completeness.md requirements.
 * @module mcp/audit/rules/completeness
 */

/**
 * @typedef {Object} CompletenessFinding
 * @property {string} ruleId - Stable rule identifier.
 * @property {string} message - Human-readable failure message.
 */

/**
 * @param {import('comment-parser').Block | null | undefined} jsdoc - Parsed JSDoc block.
 * @returns {CompletenessFinding[]} Missing requirement findings.
 */
export function evaluateDescription(jsdoc) {
  if (!jsdoc?.description?.trim()) {
    return [
      {
        ruleId: 'description',
        message: 'Missing description summary before the first @tag',
      },
    ]
  }

  return []
}

/**
 * @param {import('comment-parser').Block | null | undefined} jsdoc - Parsed JSDoc block.
 * @param {string[]} expectedParams - Parameter names from the signature.
 * @returns {CompletenessFinding[]} Missing or incomplete @param findings.
 */
export function evaluateParams(jsdoc, expectedParams) {
  if (expectedParams.length === 0) {
    return []
  }

  const paramTags = (jsdoc?.tags ?? []).filter((tag) => tag.tag === 'param')
  /** @type {CompletenessFinding[]} */
  const findings = []

  for (const paramName of expectedParams) {
    const tag = paramTags.find((entry) => entry.name === paramName)

    if (!tag) {
      findings.push({
        ruleId: 'param-coverage',
        message: `Missing @param for "${paramName}"`,
      })
      continue
    }

    if (!tag.type) {
      findings.push({
        ruleId: 'param-type',
        message: `@param "${paramName}" is missing a {type}`,
      })
    }

    if (!tag.description?.trim()) {
      findings.push({
        ruleId: 'param-description',
        message: `@param "${paramName}" is missing a description`,
      })
    }
  }

  return findings
}

/**
 * @param {import('comment-parser').Block | null | undefined} jsdoc - Parsed JSDoc block.
 * @param {'function' | 'class' | 'method' | 'constructor'} kind - Symbol kind.
 * @returns {CompletenessFinding[]} Missing or incomplete @returns findings.
 */
export function evaluateReturns(jsdoc, kind) {
  if (kind === 'class') {
    return []
  }

  const returnsTag = (jsdoc?.tags ?? []).find(
    (tag) => tag.tag === 'returns' || tag.tag === 'return'
  )

  if (!returnsTag) {
    return [
      {
        ruleId: 'returns-present',
        message: 'Missing @returns tag',
      },
    ]
  }

  /** @type {CompletenessFinding[]} */
  const findings = []

  if (!returnsTag.type) {
    findings.push({
      ruleId: 'returns-type',
      message: '@returns is missing a {type}',
    })
  }

  if (!returnsTag.description?.trim()) {
    findings.push({
      ruleId: 'returns-description',
      message: '@returns is missing a description',
    })
  }

  return findings
}

/**
 * @param {import('comment-parser').Block | null | undefined} jsdoc - Parsed JSDoc block.
 * @param {boolean} mayThrow - Whether heuristics require a @throws tag.
 * @returns {CompletenessFinding[]} Missing @throws findings.
 */
export function evaluateThrows(jsdoc, mayThrow) {
  if (!mayThrow) {
    return []
  }

  const throwsTags = (jsdoc?.tags ?? []).filter((tag) => tag.tag === 'throws')

  if (throwsTags.length === 0) {
    return [
      {
        ruleId: 'throws-heuristic',
        message:
          'Missing @throws tag (required by throw/await/reject heuristics)',
      },
    ]
  }

  return throwsTags.flatMap((tag) => {
    if (tag.description?.trim()) {
      return []
    }

    return [
      {
        ruleId: 'throws-description',
        message: '@throws is missing a description',
      },
    ]
  })
}

/**
 * @param {import('../extract-documentables.js').Documentable} documentable - Symbol under audit.
 * @returns {CompletenessFinding[]} All completeness findings for the symbol.
 */
export function evaluateDocumentable(documentable) {
  return [
    ...evaluateDescription(documentable.jsdoc),
    ...evaluateParams(documentable.jsdoc, documentable.params),
    ...evaluateReturns(documentable.jsdoc, documentable.kind),
    ...evaluateThrows(documentable.jsdoc, documentable.mayThrow),
  ]
}
