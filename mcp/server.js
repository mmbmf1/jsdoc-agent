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
import { loadDocumentables, evaluateCompliance } from './audit/index.js'
import { findMissingHeaders, resolveDirectory } from './audit/fs-utils.js'
import { formatAuditResponse } from './format-audit-response.js'
import { loadContentSpecs } from './load-content-specs.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const AGENT_DIR = path.resolve(__dirname, '../.agents')
const AGENT_FILES = {
  completeness: path.join(AGENT_DIR, 'rules/docs-completeness.md'),
  skill: path.join(AGENT_DIR, 'skills/spec-compliance/SKILL.md'),
}

const server = new McpServer({
  name: 'jsdoc-audit-server',
  version: '1.0.0',
})

server.registerTool(
  'jsdoc_audit',
  {
    description:
      'Audits JSDoc in a file with a deterministic structural report, content specs, rules, and workflow.',
    inputSchema: {
      filePath: z.string().describe('The absolute path to the file to audit'),
    },
  },
  async ({ filePath }) => {
    try {
      const [targetContent, documentables, ruleContent, skillContent, contentSpecs] =
        await Promise.all([
          fs.readFile(filePath, 'utf-8'),
          loadDocumentables(filePath),
          fs.readFile(AGENT_FILES.completeness, 'utf-8'),
          fs.readFile(AGENT_FILES.skill, 'utf-8'),
          loadContentSpecs(),
        ])

      const report = evaluateCompliance(documentables)
      const text = formatAuditResponse(
        report,
        ruleContent,
        contentSpecs,
        skillContent,
        targetContent
      )

      return {
        content: [{ type: 'text', text }],
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
      const missingHeaderPaths = await findMissingHeaders(scanRoot)

      return {
        content: [
          {
            type: 'text',
            text: missingHeaderPaths.length
              ? `Files missing JSDoc headers:\n${missingHeaderPaths.join('\n')}`
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
