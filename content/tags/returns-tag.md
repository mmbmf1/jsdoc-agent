---
type: tag
name: @returns
category: core
---

# @returns

## Concept

The `@returns` tag specifies the return type and description for a function.

## Implementation

```javascript
/**
 * @returns {number} The sum of the two numbers.
 */
function add(a, b) {
  return a + b
}
```

## Checklist

    [ ] Is the return type explicitly defined in curly braces?

    [ ] Does the description clearly state what is returned?

    [ ] Is the tag absent if the function returns void?
