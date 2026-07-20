import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { parseSource } from '../../mcp/audit/parse-source.js'
import { extractDocumentables } from '../../mcp/audit/extract-documentables.js'
import { evaluateCompliance } from '../../mcp/audit/evaluate-compliance.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixturePath = path.join(__dirname, '../fixtures/compliance-cases.js')

/**
 * @param {string} symbolName - Documentable name to evaluate.
 * @returns {import('../../mcp/audit/evaluate-compliance.js').ComplianceResult} Result for one symbol.
 */
function evaluateSymbol(symbolName) {
  const content = readFileSync(fixturePath, 'utf-8')
  const ast = parseSource(content, 'compliance-cases.js')
  const documentables = extractDocumentables(ast)
  const report = evaluateCompliance(documentables)
  const result = report.results.find((item) => item.name === symbolName)

  assert.ok(result, `expected symbol ${symbolName}`)
  return result
}

test('fully documented function → structurally_complete', () => {
  const result = evaluateSymbol('fullyDocumented')
  assert.equal(result.status, 'structurally_complete')
  assert.deepEqual(result.missing, [])
})

test('function missing @returns → incomplete', () => {
  const result = evaluateSymbol('missingReturns')
  assert.equal(result.status, 'incomplete')
  assert.ok(result.missing.includes('@returns'))
})

test('function with @returns {void} only → structurally_complete', () => {
  const result = evaluateSymbol('voidReturnsOnly')
  assert.equal(result.status, 'structurally_complete')
})

test('constructor with params, no @returns → structurally_complete', () => {
  const result = evaluateSymbol('WithConstructor.constructor')
  assert.equal(result.status, 'structurally_complete')
  assert.ok(!result.missing.includes('@returns'))
})

test('constructor missing @param → incomplete', () => {
  const result = evaluateSymbol('MissingConstructorParam.constructor')
  assert.equal(result.status, 'incomplete')
  assert.ok(result.missing.includes('@param: name'))
})

test('function with throw in body, no @throws → incomplete', () => {
  const result = evaluateSymbol('throwsWithoutTag')
  assert.equal(result.status, 'incomplete')
  assert.ok(result.missing.includes('@throws'))
})

test('function with no failure paths, no @throws → structurally_complete', () => {
  const result = evaluateSymbol('noThrowsNeeded')
  assert.equal(result.status, 'structurally_complete')
  assert.ok(!result.missing.includes('@throws'))
})

test('class with description only → structurally_complete', () => {
  const result = evaluateSymbol('DescribedClass')
  assert.equal(result.status, 'structurally_complete')
})

test('symbol with no JSDoc block → incomplete', () => {
  const result = evaluateSymbol('noJsdocBlock')
  assert.equal(result.status, 'incomplete')
  assert.ok(result.missing.includes('description'))
  assert.ok(result.missing.includes('@returns'))
})
