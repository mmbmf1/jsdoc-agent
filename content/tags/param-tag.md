---
type: tag
name: @param
category: core
---

# @param

## Concept

The `@param` tag describes a single parameter accepted by a function or method.

## Implementation

```javascript
/**
 * @param {string} name - The name of the user.
 */
function greet(name) {
  console.log(`Hello, ${name}!`)
}
```

## Checklist

    [ ] Is the parameter name identical to the code?

    [ ] Is the type defined in curly braces?

    [ ] Is there a description following the hyphen?
