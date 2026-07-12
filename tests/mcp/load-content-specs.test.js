import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  clearContentSpecsCache,
  loadContentSpecs,
} from '../../mcp/load-content-specs.js'

test('loadContentSpecs loads all 12 content files in stable order', async () => {
  clearContentSpecsCache()
  const content = await loadContentSpecs()
  const headers = [...content.matchAll(/^## content\/.+$/gm)].map(
    (match) => match[0]
  )

  assert.equal(headers.length, 12)
  assert.deepEqual(headers, [...headers].sort())
  assert.match(content, /## content\/tags\/param-tag\.md/)
  assert.match(content, /## content\/generics\/template-standards\.md/)
})

test('loadContentSpecs caches results', async () => {
  clearContentSpecsCache()
  const first = await loadContentSpecs()
  const second = await loadContentSpecs()
  assert.equal(first, second)
})
