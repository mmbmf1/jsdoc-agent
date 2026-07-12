---
name: spec-compliance
description: Evaluate JSDoc structural compliance and produce fix suggestions
---

# Spec Compliance

## Purpose

Evaluate a file against JSDoc completeness standards and report structural compliance.

## Execution Flow

1. **Structural audit** — MCP pre-computes the scan and evaluation. Present the `--- STRUCTURAL AUDIT ---` table as-is (`Structurally complete` / `Incomplete`).
2. **Fix suggestions** — For `Incomplete` rows only, suggest JSDoc snippets using `--- CONTENT SPECS ---` and `--- RULE SET ---`.
3. **Semantic review (optional)** — Only when the user asks: review description clarity and type accuracy. The checker does not score semantic quality.

## Rules for Response

- Be objective.
- Do not re-scan symbols; the structural table is authoritative.
- For incomplete symbols, provide the exact JSDoc snippet that would resolve the listed missing requirements.
