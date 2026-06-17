---
type: specification
pillar: generics
subject: template-standards
---

# Generics (Templates)

## Concept

Generics allow for type flexibility while maintaining type safety. They enable a function or class to work with any data type, while still enforcing that the input and output types match.

## Implementation

Use the `@template` tag to define type variables.

```javascript
/**
 * @template T
 * @param {T} item
 * @returns {Array<T>}
 */
function wrapInArray(item) {
  return [item]
}
```

## Checklist

    [ ] Is the @template tag present?

    [ ] Are all generic type variables (e.g., T, K, V) used consistently in @param and @returns?

    [ ] If the generic is restricted, is it clearly documented (e.g., @template {string|number} T)?

    [ ] Does the JSDoc block avoid "any" types in favor of these templates?
