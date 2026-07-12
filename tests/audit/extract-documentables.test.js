import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { parseSource } from '../../mcp/audit/parse-source.js'
import { extractDocumentables } from '../../mcp/audit/extract-documentables.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixturePath = path.join(__dirname, '../fixtures/sample-documentables.js')

test('extractDocumentables finds top-level symbols and class methods', () => {
  const content = readFileSync(fixturePath, 'utf-8')
  const ast = parseSource(content, 'sample-documentables.js')
  const documentables = extractDocumentables(ast)

  const names = documentables.map((item) => item.name)
  assert.deepEqual(names, [
    'add',
    'MathUtils',
    'MathUtils.constructor',
    'MathUtils.double',
  ])
  assert.equal(documentables.some((item) => item.name === 'nestedHelper'), false)
})

test('extractDocumentables attaches parsed JSDoc to functions', () => {
  const content = readFileSync(fixturePath, 'utf-8')
  const ast = parseSource(content, 'sample-documentables.js')
  const addSymbol = extractDocumentables(ast).find((item) => item.name === 'add')

  assert.ok(addSymbol)
  assert.equal(addSymbol.kind, 'function')
  assert.deepEqual(addSymbol.params, ['a', 'b'])
  assert.ok(addSymbol.jsdoc?.description.includes('Adds two numbers'))
})

test('parseSource accepts TypeScript syntax', () => {
  const ast = parseSource(
    'export function greet(name: string): string { return name }',
    'sample.ts'
  )

  assert.equal(ast.program.body.length, 1)
})
