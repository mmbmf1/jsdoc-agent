---
type: specification
pillar: modules
subject: module-structure
---

# Module Structure

## Concept

A module is a logical boundary for code. Proper module documentation prevents "leaky abstractions" by explicitly defining what is public (intended for external use) and what is private (internal implementation details).

## Implementation

Use the `@module` tag at the top of the file to define the unit, and use `@exports` or `@public` to explicitly define the API surface.

```javascript
/**
 * @module UserAuth
 * @description Handles all session and authentication logic.
 * * @exports {login, logout, refreshSession}
 */
```

## Checklist

    [ ] Is the @module tag defined at the top of the file?

    [ ] Are all exported functions/classes documented with @public?

    [ ] Is the module's primary responsibility described in one sentence?

    [ ] Are dependencies on other modules declared?
