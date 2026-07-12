---
name: naming-conventions
description: Clear rules for casing, intent, and structure to keep the codebase clean and consistent.
globs: ["**/*"]
---

# Naming Conventions

## 1. The Golden Rule
Code readability and predictability matter most. 

> **Consistency Wins:** If the project you are working on or the language standard contradicts the matrix below (like Python using `snake_case` for functions), **always follow the existing codebase style or language idioms** instead of these defaults.

---

## 2. Default Casing Matrix
Unless the codebase consistency rule overrides it, use these exact patterns:

| Casing | Used For | Examples |
| :--- | :--- | :--- |
| `camelCase` | Standard variables, local functions, methods, JSON keys. | `userId`, `calculateTotal`, `isActive` |
| `PascalCase` | Classes, Types, Interfaces, Modules, UI Components. | `UserProfile`, `PaymentGateway`, `UserType` |
| `snake_case` | Database tables, database columns, config/env keys. | `user_accounts`, `created_at`, `api_key` |
| `kebab-case` | URLs, slug parameters, file names, folders, CSS classes. | `/api/v1/user-profiles`, `user-card.tsx`, `.btn-primary` |
| `SCREAMING_SNAKE` | Global constants, immutable primitives. | `MAX_RETRY_ATTEMPTS`, `BASE_URL` |

---

## 3. How to Frame Names (Intent)
Names must clearly tell you what data type they are and what they actually do.

### 3.1 Booleans
Always frame booleans as a binary question using positive prefixes.
* **Allowed Prefixes:** `is`, `has`, `should`, `can`, `did`
* **Good:** `isActive`, `hasPermission`, `shouldRender`, `didComplete`
* **Bad:** `active` (ambiguous type), `notLoaded` (negative logic makes it hard to follow), `checkStatus` (sounds like a function)

### 3.2 Functions & Methods
Always start with a strong action verb that says exactly what the function does.
* **Getting Data:** Use `get` for fast, synchronous, or memory lookups. Use `fetch` for asynchronous network calls.
* **Modifying Data:** Use `set`, `update`, `create`, `delete`.
* **State Changes:** Use `toggle`, `open`, `close`.
* **Good:** `fetchUserProfile()`, `calculateInvoiceTotal()`, `toggleSidebar()`
* **Bad:** `userData()` (noun), `invoice()` (noun), `handler()` (too vague)

### 3.3 Collections and Arrays
Make it obvious that a variable holds multiple items. Use plural nouns or clear group suffixes.
* **Good:** `users`, `pendingOrders`, `configList`, `userGroup`
* **Bad:** `userData` (ambiguous), `item` (when it's actually an array), `list` (too abstract)

---

## 4. Handling Code Boundaries
When moving data between layers (like a database response entering your application logic), map the casing explicitly so external styles don't leak into the rest of the code.

### 4.1 Boundary Mapping
Convert database formats to match your internal application layout immediately at the ingestion layer.
* **Good:** `const userId = databaseResponse.user_id;`
* **Bad:** `const user_id = databaseResponse.user_id;`

### 4.2 Lifecycle Symmetry
Use clear, matching word pairs for actions that open/close or start/stop things.
* **Good:** `openSession()` / `closeSession()`, `startTransaction()` / `commitTransaction()`
* **Bad:** `openSession()` / `disconnect()`, `startTransaction()` / `end()`

---

## 5. Things to Avoid (The Ban List)

### 5.1 Single-Letter Variables
Do not use single characters for variable names. They don't provide any context.
* **Exception:** Standard loop iterators (`i`, `j`, `k`) are fine, but only inside tight blocks under 5 lines.
* **Good:** `users.forEach(user => sendEmail(user));`
* **Bad:** `users.forEach(u => sendEmail(u));`

### 5.2 Generic Suffixes
Do not append lazy, generic words to class or file names. Be descriptive about what the code actually handles.
* **Banned Words:** `Manager`, `Helper`, `Processor`, `Data`, `Util`
* **Good:** `TokenEncoder`, `InvoiceCalculator`, `S3Storage`
* **Bad:** `CryptoHelper`, `InvoiceManager`, `StorageUtil`

### 5.3 Redundant Context
Don't repeat the parent object or class name inside its own properties.
* **Good:** `user.name`, `user.email`, `customer.id`
* **Bad:** `user.userName`, `user.userEmail`, `customer.customerId`