/**
 * Loads and concatenates content spec files for MCP audit prompts.
 * @module mcp/load-content-specs
 */
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CONTENT_DIR = path.resolve(__dirname, '../content')

/** @type {string | null} */
let cachedContentSpecs = null

/**
 * @param {string} directory - Root directory to scan.
 * @returns {Promise<string[]>} Absolute paths to Markdown files.
 */
async function collectMarkdownFiles(directory) {
  /** @type {string[]} */
  const files = []
  const entries = await fs.readdir(directory, { withFileTypes: true })

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      files.push(...(await collectMarkdownFiles(entryPath)))
      continue
    }

    if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(entryPath)
    }
  }

  return files
}

/**
 * @returns {Promise<string>} Concatenated content spec Markdown.
 */
export async function loadContentSpecs() {
  if (cachedContentSpecs) {
    return cachedContentSpecs
  }

  const files = (await collectMarkdownFiles(CONTENT_DIR)).sort()
  const sections = await Promise.all(
    files.map(async (filePath) => {
      const relativePath = path.relative(path.resolve(__dirname, '..'), filePath)
      const content = await fs.readFile(filePath, 'utf-8')
      return `## ${relativePath}\n\n${content}`
    })
  )

  cachedContentSpecs = sections.join('\n\n')
  return cachedContentSpecs
}

/**
 * Clears cached content specs (for tests).
 */
export function clearContentSpecsCache() {
  cachedContentSpecs = null
}

/**
 * @returns {string} Absolute path to the content directory.
 */
export function getContentDir() {
  return CONTENT_DIR
}
