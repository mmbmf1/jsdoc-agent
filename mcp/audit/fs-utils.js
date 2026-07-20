/**
 * Shared filesystem helpers for MCP directory scans.
 * @module mcp/audit/fs-utils
 */
import fs from 'fs/promises'
import path from 'path'
import { hasFileLevelJSDoc } from './file-header.js'

export const SOURCE_FILE = /\.(js|ts)$/
export const SKIP_DIRS = new Set(['node_modules', '.git'])

/**
 * Resolves a user-supplied directory path to an absolute, existing directory.
 * @param {string} input - Directory path (absolute, relative, or `~/...`).
 * @returns {Promise<string>} Absolute path to the resolved directory.
 * @throws {Error} When no candidate path exists or is a directory.
 */
export async function resolveDirectory(input) {
  const expanded = input.replace(/^~\//, `${process.env.HOME}/`)
  const candidates = [
    expanded,
    path.resolve(expanded),
    path.resolve(process.cwd(), expanded),
    path.resolve(process.env.HOME || '', expanded),
  ]

  for (const candidate of candidates) {
    try {
      if ((await fs.stat(candidate)).isDirectory()) {
        return candidate
      }
    } catch {
      // not found at this path, try the next candidate
    }
  }

  throw new Error(`Directory not found: ${input}`)
}

/**
 * Recursively scans a directory tree for `.js`/`.ts` files missing a file-level JSDoc header.
 * @param {string} scanRoot - Absolute root directory to scan.
 * @returns {Promise<string[]>} Relative paths of files missing headers.
 */
export async function findMissingHeaders(scanRoot) {
  /** @type {string[]} */
  const missingHeaderPaths = []

  async function walk(directory) {
    const entries = await fs.readdir(directory, { withFileTypes: true })

    for (const entry of entries) {
      const filePath = path.join(directory, entry.name)

      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) {
          await walk(filePath)
        }
        continue
      }

      if (!SOURCE_FILE.test(entry.name)) {
        continue
      }

      const content = await fs.readFile(filePath, 'utf-8')
      if (!hasFileLevelJSDoc(content, entry.name)) {
        missingHeaderPaths.push(path.relative(scanRoot, filePath))
      }
    }
  }

  await walk(scanRoot)
  return missingHeaderPaths
}
