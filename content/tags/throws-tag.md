---
type: tag
name: @throws
category: core
---

# @throws

## Concept

The `@throws` tag documents the exceptions that a function may throw.

## Implementation

```javascript
/**
 * @throws {Error} If the input is negative.
 */
function process(input) {
  if (input < 0) throw new Error('Negative input')
}
```

## Checklist

    [ ] Is the error type (e.g., Error, TypeError) specified?

    [ ] Are the conditions for throwing the error clearly described?

    [ ] Are all thrown exceptions documented?
