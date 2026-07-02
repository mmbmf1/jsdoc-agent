import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { hasFileLevelJSDoc } from '../../mcp/audit/file-header.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixturesDir = path.join(__dirname, '../fixtures')

test('hasFileLevelJSDoc detects described module headers', () => {
  const content = readFileSync(
    path.join(fixturesDir, 'with-file-header.js'),
    'utf-8'
  )

  assert.equal(hasFileLevelJSDoc(content, 'with-file-header.js'), true)
})

test('hasFileLevelJSDoc rejects files without a described header', () => {
  const content = readFileSync(
    path.join(fixturesDir, 'without-file-header.js'),
    'utf-8'
  )

  assert.equal(hasFileLevelJSDoc(content, 'without-file-header.js'), false)
})

test('hasFileLevelJSDoc rejects empty JSDoc blocks', () => {
  const content = '/**\n */\nexport function ok() {}'
  assert.equal(hasFileLevelJSDoc(content, 'empty-header.js'), false)
})
