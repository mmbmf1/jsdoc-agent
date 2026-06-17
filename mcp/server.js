#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const SOURCE_FILE = /\.(js|ts)$/
const SKIP_DIRS = new Set(['node_modules', '.git'])

function hasJSDocHeader(content) {
  const firstLines = content.split('\n', 5).join('\n')
  return firstLines.includes('/**') && firstLines.includes('*/')
}

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
      if (!hasJSDocHeader(content)) {
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
    description: 'Audits JSDoc in a given file against project standards.',
    inputSchema: {
      filePath: z.string().describe('The absolute path to the file to audit'),
    },
  },
  async ({ filePath }) => {
    try {
      // 1. Read the file requested by the user
      const targetContent = await fs.readFile(filePath, 'utf-8')

      // 2. Read your rule definition
      // Make sure this path is correct relative to where you run the server
      const rulePath = path.resolve(
        __dirname,
        '../agent/rules/docs-completeness.md'
      )
      const ruleContent = await fs.readFile(rulePath, 'utf-8')

      // 3. For now, let's just confirm we can see both
      return {
        content: [
          {
            type: 'text',
            text: `--- RULE SET ---\n${ruleContent}\n\n--- TARGET CODE ---\n${targetContent}\n\nPlease audit the Target Code against the Rule Set above.`,
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
      'Scans directory for files lacking a proper JSDoc file-level header.',
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
