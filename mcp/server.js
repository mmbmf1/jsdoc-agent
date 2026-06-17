#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

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

// 3. Start the Server
const transport = new StdioServerTransport()
await server.connect(transport)

console.log('JSDoc Audit Server is running...')
