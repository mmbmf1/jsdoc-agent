#!/usr/bin/env node
/**
 * MCP stdio server exposing JSDoc audit and directory-scan tools.
 * @module mcp/server
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { hasFileLevelJSDoc } from './audit/file-header.js'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const AGENT_DIR = path.resolve(__dirname, '../agent')
const AGENT_FILES = {
  completeness: path.join(AGENT_DIR, 'rules/docs-completeness.md'),
  skill: path.join(AGENT_DIR, 'skills/spec-compliance-skill.md'),
}

const SOURCE_FILE = /\.(js|ts)$/
const SKIP_DIRS = new Set(['node_modules', '.git'])

/**
 * Checks whether a file has a described file-level JSDoc block.
 * @param {string} content - Raw file content to inspect.
 * @param {string} filename - File name used for parser mode selection.
 * @returns {boolean} True when a described file-level JSDoc block is attached to the file.
 */
function hasJSDocHeader(content, filename) {
  return hasFileLevelJSDoc(content, filename)
}

/**
 * Resolves a user-supplied directory path to an absolute, existing directory.
 * Tries the path as-is, resolved, cwd-relative, and home-relative variants.
 * @param {string} input - Directory path (absolute, relative, or `~/...`).
 * @returns {Promise<string>} Absolute path to the resolved directory.
 * @throws {Error} When no candidate path exists or is a directory.
 */
async function resolveDirectory(input) {
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
 * Skips `node_modules` and `.git`.
 * @param {string} scanRoot - Absolute root directory to scan.
 * @returns {Promise<string[]>} Relative paths of files missing headers.
 * @throws {Error} When directory reads fail (e.g. permission denied).
 */
async function findMissingHeaders(scanRoot) {
  const missing = []

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
      if (!hasJSDocHeader(content, entry.name)) {
        missing.push(path.relative(scanRoot, filePath))
      }
    }
  }

  await walk(scanRoot)
  return missing
}

// 1. Initialize the Server
const server = new McpServer({
  name: 'jsdoc-audit-server',
  version: '1.0.0',
})

// 2. Register your 'jsdoc_audit' tool
server.registerTool(
  'jsdoc_audit',
  {
    description:
      'Audits JSDoc in a given file using docs-completeness.md (rules) and spec-compliance-skill.md (workflow).',
    inputSchema: {
      filePath: z.string().describe('The absolute path to the file to audit'),
    },
  },
  async ({ filePath }) => {
    try {
      // 1. Read the file requested by the user
      const targetContent = await fs.readFile(filePath, 'utf-8')

      const [ruleContent, skillContent] = await Promise.all([
        fs.readFile(AGENT_FILES.completeness, 'utf-8'),
        fs.readFile(AGENT_FILES.skill, 'utf-8'),
      ])

      return {
        content: [
          {
            type: 'text',
            text: `--- RULE SET ---\n${ruleContent}\n\n--- AUDIT WORKFLOW ---\n${skillContent}\n\n--- TARGET CODE ---\n${targetContent}\n\nPlease audit the Target Code using the Rule Set and Audit Workflow above.`,
          },
        ],
      }
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error.message}` }],
        isError: true,
      }
    }
  }
)

server.registerTool(
  'find_files_needing_docs',
  {
    description:
      'Scans directory for files lacking a described file-level JSDoc block.',
    inputSchema: z.object({
      directory: z.string().describe('Path to the directory to scan'),
    }),
  },
  async ({ directory }) => {
    try {
      const scanRoot = await resolveDirectory(directory)
      const missing = await findMissingHeaders(scanRoot)

      return {
        content: [
          {
            type: 'text',
            text: missing.length
              ? `Files missing JSDoc headers:\n${missing.join('\n')}`
              : 'No files missing JSDoc headers.',
          },
        ],
      }
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error.message}` }],
        isError: true,
      }
    }
  }
)

// 3. Start the Server
const transport = new StdioServerTransport()
await server.connect(transport)

console.error('JSDoc Audit Server is running...')
