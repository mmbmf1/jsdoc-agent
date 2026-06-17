---
type: type-definition
name: Primitives
category: types
---

# Primitives

## Concept

Primitive types represent the most basic building blocks of the data in our system. Standardizing these prevents ambiguity.

## Implementation

```javascript
/**
 * @param {string} name - The user's name.
 * @param {number} age - The user's age.
 * @param {boolean} isActive - Whether the account is active.
 * @param {Array<string>} tags - A list of categories.
 */
```

## Checklist

    [ ] Are primitive types lowercase (e.g., string, not String)?

    [ ] Are generic structures properly wrapped (e.g., Array<type>)?

    [ ] Is there ambiguity that should be resolved by a @typedef instead?
