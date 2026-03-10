# Markdown Prompt Structure Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a production-ready markdown prompt section beneath the generated landing-page brief so users can copy or export a structured AI-ready prompt instead of only reading the preview prose.

**Architecture:** Keep the current generated prose and palette as the creative preview, then derive a second markdown prompt client-side from the parsed result, selected style, selected accent, and palette. Use a pure helper module for markdown prompt assembly so the structure is testable independently, and extend the page UI with a second output block plus dedicated copy/export actions.

**Tech Stack:** Svelte 5, SvelteKit 2, TypeScript, Vitest browser tests, Markdown string generation.

---

### Task 1: Add markdown prompt builder and tests

**Files:**

- Create: `src/lib/landing-generator/markdown.ts`
- Modify: `src/lib/landing-generator/parser.spec.ts`

**Step 1: Write the failing test**

Add a test that verifies a helper returns markdown with these sections in order:

- `# Role`
- `# Design Logic`
- `# Color Palette`
- `# Build Instructions`

and includes the generated three-paragraph prompt plus the palette colors.

**Step 2: Run test to verify it fails**

Run: `bun run test:unit src/lib/landing-generator/parser.spec.ts --run`
Expected: FAIL because the markdown builder does not exist yet.

**Step 3: Write minimal implementation**

Create `src/lib/landing-generator/markdown.ts` with a helper that:

- accepts selected style, selected accent, parsed result
- returns a markdown string ready for copy/paste
- uses best-practice structure from research: explicit role, context/design logic, structured palette list, and concrete build instructions/constraints

**Step 4: Run test to verify it passes**

Run: `bun run test:unit src/lib/landing-generator/parser.spec.ts --run`
Expected: PASS.

**Step 5: Commit**

Skip git actions in this repo.

### Task 2: Render the markdown prompt block in the page UI

**Files:**

- Modify: `src/routes/+page.svelte`
- Modify: `src/routes/page.svelte.spec.ts`

**Step 1: Write the failing browser tests**

Add tests for:

- a second output section rendered beneath the preview
- markdown prompt text containing the best-practice headings
- separate `Copy Markdown Prompt` and `Export Markdown` actions

**Step 2: Run test to verify it fails**

Run: `bun run test:unit src/routes/page.svelte.spec.ts --run`
Expected: FAIL because the markdown section is not rendered yet.

**Step 3: Write minimal implementation**

Update `src/routes/+page.svelte` to:

- derive a markdown prompt from the current `result`
- render a second output card below the preview/palette
- keep the existing preview actions intact
- add copy and `.md` export actions for the markdown prompt

**Step 4: Run tests/checks**

Run: `bun run test:unit src/routes/page.svelte.spec.ts --run && bun run check`
Expected: PASS.

**Step 5: Commit**

Skip git actions in this repo.

### Task 3: Final verification

**Files:**

- Modify: `README.md` only if the UI wording or export behavior needs documenting

**Step 1: Run verification**

Run: `bun run check && bun run test`
Expected: PASS.

**Step 2: Commit**

Skip git actions in this repo.
