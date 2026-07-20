import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { findMissingHeaders, resolveDirectory } from '../../mcp/audit/fs-utils.js'

test('resolveDirectory resolves absolute paths', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'jsdoc-agent-fs-'))

  try {
    const resolved = await resolveDirectory(directory)
    assert.equal(resolved, directory)
  } finally {
    await import('node:fs/promises').then(({ rm }) =>
      rm(directory, { recursive: true, force: true })
    )
  }
})

test('findMissingHeaders lists js files without described headers', async () => {
  const scanRoot = await mkdtemp(path.join(os.tmpdir(), 'jsdoc-agent-scan-'))

  try {
    await writeFile(
      path.join(scanRoot, 'missing.js'),
      'export function noHeader() {}\n',
      'utf-8'
    )
    await writeFile(
      path.join(scanRoot, 'present.js'),
      '/**\n * Module docs.\n */\nexport function ok() {}\n',
      'utf-8'
    )
    await mkdir(path.join(scanRoot, 'node_modules'), { recursive: true })
    await writeFile(
      path.join(scanRoot, 'node_modules', 'ignored.js'),
      'export function ignored() {}\n',
      'utf-8'
    )

    const missing = await findMissingHeaders(scanRoot)
    assert.deepEqual(missing, ['missing.js'])
  } finally {
    await import('node:fs/promises').then(({ rm }) =>
      rm(scanRoot, { recursive: true, force: true })
    )
  }
})
