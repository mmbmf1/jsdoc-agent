#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { auditFile } from './audit/index.js'
import { formatHybridAuditResponse } from './audit/format-response.js'
import { hasFileLevelJSDoc } from './audit/file-header.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const AGENT_DIR = path.resolve(__dirname, '../agent')
const AGENT_FILES = {
  completeness: path.join(AGENT_DIR, 'rules/docs-completeness.md'),
  skill: path.join(AGENT_DIR, 'skills/spec-compliance-skill.md'),
}

const SOURCE_FILE = /\.(js|ts)$/
const SKIP_DIRS = new Set(['node_modules', '.git'])

function hasJSDocHeader(content, filename) {
  return hasFileLevelJSDoc(content, filename)
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
      if (!hasJSDocHeader(content, entry.name)) {
        missing.push(path.relative(scanRoot, filePath))
      }
    }
  }

  await walk(scanRoot)
  return missing
}

const server = new McpServer({
  name: 'jsdoc-audit-server',
  version: '1.1.0',
})

server.registerTool(
  'jsdoc_audit',
  {
    description:
      'Deterministically audits JSDoc completeness, then optionally includes LLM fix guidance for failed symbols.',
    inputSchema: {
      filePath: z.string().describe('The absolute path to the file to audit'),
      suggestFixes: z
        .boolean()
        .optional()
        .default(true)
        .describe(
          'When true, include rule/workflow context for LLM fix suggestions on failures'
        ),
    },
  },
  async ({ filePath, suggestFixes = true }) => {
    try {
      const report = await auditFile(filePath)
      const [ruleContent, skillContent] = await Promise.all([
        fs.readFile(AGENT_FILES.completeness, 'utf-8'),
        fs.readFile(AGENT_FILES.skill, 'utf-8'),
      ])

      return {
        content: [
          {
            type: 'text',
            text: formatHybridAuditResponse(
              report,
              ruleContent,
              skillContent,
              suggestFixes
            ),
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

const transport = new StdioServerTransport()
await server.connect(transport)

console.error('JSDoc Audit Server is running...')
