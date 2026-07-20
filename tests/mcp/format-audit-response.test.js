import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { parseSource } from '../../mcp/audit/parse-source.js'
import { extractDocumentables } from '../../mcp/audit/extract-documentables.js'
import { evaluateCompliance } from '../../mcp/audit/evaluate-compliance.js'
import { formatAuditResponse } from '../../mcp/format-audit-response.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../..')
const fixturePath = path.join(__dirname, '../fixtures/sample-documentables.js')

test('formatAuditResponse includes structural audit, content specs, and legacy sections', () => {
  const source = readFileSync(fixturePath, 'utf-8')
  const ast = parseSource(source, 'sample-documentables.js')
  const report = evaluateCompliance(extractDocumentables(ast))
  const rules = readFileSync(
    path.join(repoRoot, '.agents/rules/docs-completeness.md'),
    'utf-8'
  )
  const skill = readFileSync(
    path.join(repoRoot, '.agents/skills/spec-compliance/SKILL.md'),
    'utf-8'
  )
  const contentSpecs = '## content/tags/param-tag.md\n\n@param spec'

  const response = formatAuditResponse(
    report,
    rules,
    contentSpecs,
    skill,
    source
  )

  assert.match(response, /--- STRUCTURAL AUDIT ---/)
  assert.match(response, /--- RULE SET ---/)
  assert.match(response, /--- CONTENT SPECS ---/)
  assert.match(response, /--- AUDIT WORKFLOW ---/)
  assert.match(response, /--- TARGET CODE ---/)
  assert.match(response, /\| add \|/)
})
