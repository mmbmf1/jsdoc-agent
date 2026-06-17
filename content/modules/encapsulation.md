---
type: specification
pillar: modules
subject: encapsulation
---

# Encapsulation

## Concept

Encapsulation is the practice of hiding the internal state and implementation details of a module. Exposing internal helpers as part of a public API creates tight coupling and makes refactoring dangerous.

## Implementation

Use `@private` or `@inner` tags to mark functions, variables, or classes that are intended for internal use only.

```javascript
/**
 * @module UserAuth
 */

/**
 * @private
 * @function validatePasswordStrength
 * @description Internal helper; not for external use.
 */
function validatePasswordStrength(password) {
  // Logic here
}
```

## Checklist

    [ ] Are internal-only functions marked with the @private tag?

    [ ] Does the JSDoc block clearly state why the code is private (e.g., "internal helper")?

    [ ] Has the agent verified that this function is not called by any external modules?

    [ ] If a function is @private, is there a public wrapper that actually handles the task?
