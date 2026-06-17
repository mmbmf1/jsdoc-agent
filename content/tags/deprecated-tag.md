---
type: tag
name: @deprecated
category: core
---

# @deprecated

## Concept
The `@deprecated` tag indicates that the documented code should no longer be used and will be removed in future versions.

## Implementation
```javascript
/**
 * @deprecated Use `newFunction()` instead.
 */
function oldFunction() {
  // ...
}

Checklist

    [ ] Is there a clear reason for the deprecation?

    [ ] Is the replacement (if any) explicitly mentioned?

    [ ] Is the tag placed at the top of the JSDoc block?