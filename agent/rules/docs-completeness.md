# Rule: JSDoc Completeness

Every public function or method must be documented with the following requirements:

1. **Description**: A concise summary of what the function does.
2. **@param**: Every argument must have a defined type and description.
3. **@returns**: Must specify the return type and a description of the result.
4. **@throws**: If the function performs operations that can fail, document the error types.

## Enforcement
When auditing code, if any of these four elements are missing, the agent must flag the function as "Incomplete" and suggest the missing tags.