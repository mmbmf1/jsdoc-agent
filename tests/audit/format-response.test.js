import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { auditFile } from '../../mcp/audit/index.js'
import { formatHybridAuditResponse } from '../../mcp/audit/format-response.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixturesDir = path.join(__dirname, '../fixtures')

test('formatHybridAuditResponse includes JSON and table for passing audits', async () => {
  const report = await auditFile(path.join(fixturesDir, 'sample-documentables.js'))
  const text = formatHybridAuditResponse(report, 'rules', 'skill', true)

  assert.match(text, /--- AUDIT REPORT \(JSON\) ---/)
  assert.match(text, /--- COMPLIANCE TABLE ---/)
  assert.doesNotMatch(text, /--- FIX SUGGESTION CONTEXT ---/)
})

test('formatHybridAuditResponse includes fix context only for failures', async () => {
  const report = await auditFile(path.join(fixturesDir, 'missing-param.js'))
  const text = formatHybridAuditResponse(report, 'rules', 'skill', true)

  assert.match(text, /--- FIX SUGGESTION CONTEXT ---/)
  assert.match(text, /increment/)
  assert.match(text, /--- RULE SET ---/)
})

test('formatHybridAuditResponse omits fix context when disabled', async () => {
  const report = await auditFile(path.join(fixturesDir, 'missing-param.js'))
  const text = formatHybridAuditResponse(report, 'rules', 'skill', false)

  assert.doesNotMatch(text, /--- FIX SUGGESTION CONTEXT ---/)
})
