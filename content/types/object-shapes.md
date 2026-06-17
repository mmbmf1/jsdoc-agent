---
type: type-definition
name: Object Shapes
category: types
---

# Object Shapes

## Concept

Object shapes represent complex data models. Instead of passing loose parameters, we group related data into named structures to improve maintainability and type-safety.

## Implementation

```javascript
/**
 * @typedef {Object} UserProfile
 * @property {string} id - The unique user identifier.
 * @property {string} [email] - The user's email address (optional).
 * @property {number} accessLevel - The user's permission tier.
 */
```

## Checklist

    [ ] Is the object structure defined via @typedef and @property tags?

    [ ] Are all object keys properly documented with their respective types?

    [ ] Is there a clear separation between required and optional properties? (Use [] syntax for optionality).

    [ ] Is the structure named meaningfully for reusability?
