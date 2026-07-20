# Rule: JSDoc Completeness

Every public function, method, or class (including constructors and public class methods) must be documented with the following requirements:

1. **Description**: A concise summary of what the function does.
2. **@param**: Every argument must have a defined type and description.
3. **@returns**: Must specify the return type and a description of the result.
4. **@throws**: If the function performs operations that can fail, document the error types.

## Enforcement
When auditing code, if any of these four elements are missing, the agent must flag the function as "Incomplete" and suggest the missing tags.

## Structural checks

The MCP server evaluates structural completeness deterministically. Semantic quality (clarity, type accuracy) remains the agent's responsibility.

| Kind | Description | `@param` | `@returns` | `@throws` |
| --- | --- | --- | --- | --- |
| `function`, `method` | Non-empty | Every signature param | Required (`{void}` ok) | When body can fail |
| `constructor` | Non-empty | Every constructor param | Not checked | When body can fail |
| `class` | Non-empty on declaration | — | — | — |

Tag shape: `@param`, `@returns`, and `@throws` require `{type}` braces and description text after the hyphen. No JSDoc block lists all applicable missing tags.
