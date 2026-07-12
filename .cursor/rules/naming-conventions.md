---
description: Enforce strict naming conventions, casing matrices, and architectural semantic boundaries across the codebase.
globs: ['**/*']
---

# Agent Skill: Naming Conventions

## 1. Operational Core Directive

When generating, refactoring, or auditing code, naming must be treated as a primary architectural pillar. Your goal is to maximize code readability, reduce cognitive load, and maintain structural predictability.

> **Absolute Priority Rule (Codebase Consistency):** If the target codebase or language standard directly contradicts the default casing/naming matrix defined below (e.g., Python using `snake_case` for functions), you MUST prioritize consistency with the existing codebase or standard language idioms over these agnostic defaults.

---

## 2. The Casing Matrix (Default Heuristics)

Unless overridden by the _Codebase Consistency_ rule, apply these exact casing patterns across system boundaries:

| Casing Style      | Target Architectural Elements                                                    | Examples                                                 |
| :---------------- | :------------------------------------------------------------------------------- | :------------------------------------------------------- |
| `camelCase`       | Standard variables, local functions, object methods, JSON properties.            | `userId`, `calculateTotal`, `isActive`                   |
| `PascalCase`      | Classes, Types, Interfaces, Modules, UI Components (React/Vue/etc.).             | `UserProfile`, `PaymentGateway`, `UserType`              |
| `snake_case`      | Database tables, database columns, configuration keys, system environment files. | `user_accounts`, `created_at`, `api_key`                 |
| `kebab-case`      | URL paths, slug parameters, file names, asset directories, CSS classes.          | `/api/v1/user-profiles`, `user-card.tsx`, `.btn-primary` |
| `SCREAMING_SNAKE` | Global constants, immutable primitives, configuration constants.                 | `MAX_RETRY_ATTEMPTS`, `BASE_URL`                         |

---

## 3. Grammar & Semantics (Intent)

Every name must clearly declare its intent, data type, and role through predictable linguistic patterns.

### 3.1 Booleans

Must always be framed as a binary question using affirmative prefixes.

- **Allowed Prefixes:** `is`, `has`, `should`, `can`, `did`
- **Good:** `isActive`, `hasPermission`, `shouldRender`, `didComplete`
- **Bad:** `active` (ambiguous type), `notLoaded` (negative logic), `checkStatus` (sounds like a function)

### 3.2 Functions & Methods

Must always start with a strong imperative action verb indicating exactly what the function _does_.

- **Retrieval:** Use `get` for synchronous/memory retrieval; use `fetch` for asynchronous/network operations.
- **Modification:** Use `set`, `update`, `create`, `delete`.
- **Toggles:** Use `toggle`, `open`, `close`.
- **Good:** `fetchUserData()`, `calculateInvoiceTotal()`, `toggleSidebar()`
- **Bad:** `userData()` (noun), `invoice()` (noun), `handler()` (vague)

### 3.3 Collections & Datasets

Must explicitly state that they contain multiple items. Use plural nouns or specific architectural structural suffixes.

- **Good:** `users`, `pendingOrders`, `configList`, `userGroup`
- **Bad:** `userData` (ambiguous), `item` (when referencing an array), `list` (too abstract)

---

## 4. Cross-Layer Translation (Architecture)

When transferring data across boundaries (e.g., Database -> Application Layer -> Frontend API), map casing explicitly rather than allowing external conventions to leak.

### 4.1 Boundary Mapping

Isolate database and network serialization formats from internal application logic at the ingestion layer.

- **Good:** `const userId = databaseResponse.user_id;`
- **Bad:** `const user_id = databaseResponse.user_id;`

### 4.2 Architectural Symmetry

Maintain linguistic pairings across complementary lifecycle actions, states, or teardown processes.

- **Good:** `openSession()` / `closeSession()`, `startTransaction()` / `commitTransaction()`
- **Bad:** `openSession()` / `disconnect()`, `startTransaction()` / `end()`

---

## 5. Negative Constraints (The Ban List)

You are strictly prohibited from utilizing the following naming anti-patterns.

### 5.1 Single-Letter Variables

Do not use single characters for identifiers, as they lack semantic context.

- **Exception:** Allowed strictly for standard mathematical or loop iterators (`i`, `j`, `k`) within a tight local block scope under 5 lines.
- **Good:** `users.forEach(user => sendEmail(user));`
- **Bad:** `users.forEach(u => sendEmail(u));`

### 5.2 Ambiguous Structural Suffixes

Do not append generic structural words to class or file names. Be specific about the functional domain.

- **Banned Suffixes:** `Manager`, `Helper`, `Processor`, `Data`, `Util`
- **Good:** `TokenEncoder`, `InvoiceCalculator`, `S3Storage`
- **Bad:** `CryptoHelper`, `InvoiceManager`, `StorageUtil`

### 5.3 Redundant Context

Do not repeat the context of a parent object, class, or module inside its child properties or fields.

- **Good:** `user.name`, `user.email`, `customer.id`
- **Bad:** `user.userName`, `user.userEmail`, `customer.customerId`
