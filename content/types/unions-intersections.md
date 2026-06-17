---
type: type-definition
name: Union and Intersection Types
category: types
---

# Union and Intersection Types

## Concept
Union types (`|`) define a variable that can accept multiple distinct types. Intersection types (`&`) create a new type by combining all members of existing types. These are essential for creating flexible, robust API definitions.

## Implementation
```javascript
/**
 * Union: A parameter that can be a string ID or a numeric ID.
 * @param {string|number} id - The identifier.
 * * Intersection: A session combining User data with Admin permissions.
 * @typedef {User & Admin} AdminSession
 */

Checklist

    [ ] Are Union types correctly using the pipe operator (|)?

    [ ] Are Intersection types correctly using the ampersand operator (&)?

    [ ] Is the intent behind the union clearly explained in the documentation?

    [ ] Does the implementation follow the standard JSDoc tag-type-name format?