---
type: tag
name: @typedef
category: core
---

# @typedef

## Concept
The `@typedef` tag defines a custom type. This is essential for documenting complex objects or reusable data shapes, allowing for cleaner code and better IDE intellisense.

## Implementation
```javascript
/**
 * @typedef {Object} UserProfile
 * @property {number} id - The user's unique identifier.
 * @property {string} username - The user's display name.
 */

Checklist

    [ ] Is the type defined as an {Object}?

    [ ] Are all fields defined using @property?

    [ ] Is the type name PascalCase?