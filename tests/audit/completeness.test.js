import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { auditFile } from '../../mcp/audit/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixturesDir = path.join(__dirname, '../fixtures')

test('auditFile marks fully documented symbols as pass', async () => {
  const report = await auditFile(path.join(fixturesDir, 'sample-documentables.js'))

  assert.ok(report.summary.total >= 4)
  assert.equal(
    report.results.find((result) => result.symbol === 'add')?.status,
    'pass'
  )
})

test('auditFile flags missing @param tags', async () => {
  const report = await auditFile(path.join(fixturesDir, 'missing-param.js'))
  const increment = report.results.find((result) => result.symbol === 'increment')

  assert.equal(increment?.status, 'fail')
  assert.ok(increment?.missing.some((item) => item.includes('@param')))
})

test('auditFile flags missing @throws via heuristics', async () => {
  const report = await auditFile(path.join(fixturesDir, 'missing-param.js'))
  const readConfig = report.results.find(
    (result) => result.symbol === 'readConfig'
  )

  assert.equal(readConfig?.status, 'fail')
  assert.ok(readConfig?.ruleIds.includes('throws-heuristic'))
})

test('auditFile accepts documented @throws tags', async () => {
  const report = await auditFile(path.join(fixturesDir, 'throws-without-tag.js'))
  const normalize = report.results.find((result) => result.symbol === 'normalize')

  assert.equal(normalize?.status, 'pass')
})

test('auditFile keeps deterministic JSON shape', async () => {
  const filePath = path.join(fixturesDir, 'missing-param.js')
  const first = await auditFile(filePath)
  const second = await auditFile(filePath)

  assert.deepEqual(first, second)
})
