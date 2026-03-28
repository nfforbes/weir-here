---
name: brochure-generator
description: Converts webpages into print-ready brochures with structured layout, marketing copy optimization, and export to PDF. Use when the user asks for a brochure, print layout, tri-fold, PDF from a page, or marketing collateral from site content.
---

# Brochure generator

## When to apply

Use this skill when generating brochures from existing sites, URLs, page copy, or component content—especially tri-folds, print HTML, or PDF-ready output.

## Workflow

1. **Ingest content** from the webpage, route, or pasted markup/copy.
2. **Extract semantic sections**: map content into `hero`, `features` (or benefits/services), and `CTA`. Merge duplicate ideas; drop nav, footers, and boilerplate unless they carry a clear message.
3. **Rewrite**: short, persuasive marketing copy. Headlines scannable; bullets tight; one primary CTA per panel where possible.
4. **Lay out as tri-fold** (6 panels, outside + inside when both are needed):
   - Typical outside: cover (hero + brand), teaser/service, contact/CTA.
   - Typical inside: expanded features, proof/trust, strong CTA.
5. **Brand**: preserve stated colors, fonts, and tone from the source site or project theme (e.g. CSS variables). If unknown, infer from provided styles and note assumptions briefly.
6. **Output**: single HTML document **optimized for print** (A4 or Letter—ask if unclear; default Letter for US context).

## Print HTML rules

- Include `@media print` with sensible margins; use `cm` or `in` for page size.
- Prefer **`@page { size: A4; margin: ... }`** or **`size: letter`** as requested.
- Avoid reliance on viewport units for critical dimensions inside brochure panels; use fixed units or mm for panel widths where tri-fold math is explicit.
- Use print-friendly backgrounds (`print-color-adjust` / `-webkit-print-color-adjust: exact` where brand colors must survive print).
- Structure with clear panel wrappers (e.g. `.brochure-panel`) for each fold column/page flow.

## Quality bar

- Copy must read as **professional marketing**, not a dump of the site nav.
- Every panel should have a **clear purpose**; no orphan headings.
- End with brief notes on **how to print to PDF** (browser Print → Save as PDF, margins, background graphics if needed).
