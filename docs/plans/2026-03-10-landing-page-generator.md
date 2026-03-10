# Landing Page Generator Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a single-page SvelteKit landing page generator that lets users choose or randomize a design style, call GPT-5.4 through a secure server proxy, and render a three-paragraph prompt with a validated five-color palette.

**Architecture:** Keep the UI as one route in `src/routes/+page.svelte`, with small presentational components in `src/lib/components` and pure helper modules in `src/lib/landing-generator`. Send generation requests through `src/routes/api/generate/+server.ts` so the FXZLY API key stays private in `$env/static/private`, while the client only talks to the local endpoint. Use pure utility tests for parsing/randomization and browser component tests for the page flow, then finish with `bun run check` and `bun run test`.

**Tech Stack:** Svelte 5 runes, SvelteKit 2, TypeScript, Tailwind CSS v4, Vitest browser tests, Fetch API, private server env vars.

---

### Task 1: Create the domain model, prompt spec, fallback palette, parser, and randomizer helpers

**Files:**

- Create: `src/lib/landing-generator/types.ts`
- Create: `src/lib/landing-generator/config.ts`
- Create: `src/lib/landing-generator/prompt.ts`
- Create: `src/lib/landing-generator/parser.ts`
- Create: `src/lib/landing-generator/random.ts`
- Create: `src/lib/landing-generator/parser.spec.ts`

**Step 1: Write the failing tests**

Create `src/lib/landing-generator/parser.spec.ts` with tests for:

```ts
import { describe, expect, it } from 'vitest';
import { FALLBACK_PALETTE } from './config';
import { parseResponse } from './parser';
import { pickRandomStyle } from './random';

describe('parseResponse', () => {
	it('extracts prose and palette JSON', () => {
		const raw = `Paragraph one.\n\nParagraph two.\n\nParagraph three.\n\n{
		  "palette_name": "Quiet Current",
		  "mood": "Calm and precise.",
		  "colors": [
		    { "hex": "#112233", "role": "Primary", "name": "Ink" },
		    { "hex": "#445566", "role": "Secondary", "name": "Fog" },
		    { "hex": "#778899", "role": "Accent", "name": "Mist" },
		    { "hex": "#F5F3EE", "role": "Background", "name": "Paper" },
		    { "hex": "#111111", "role": "Surface / Text", "name": "Charcoal" }
		  ]
		}`;

		const result = parseResponse(raw);

		expect(result.prompt.split('\n\n')).toHaveLength(3);
		expect(result.palette?.palette_name).toBe('Quiet Current');
	});

	it('falls back when palette JSON is invalid', () => {
		const result = parseResponse('Three paragraphs\n\n{not valid json}');
		expect(result.palette).toEqual(FALLBACK_PALETTE);
	});
});

describe('pickRandomStyle', () => {
	it('never repeats the immediate previous style when alternatives exist', () => {
		const items = ['A', 'B', 'C'];
		const next = pickRandomStyle(items, 'B', () => 1);
		expect(next).not.toBe('B');
	});

	it('returns the only style when the list has one item', () => {
		expect(pickRandomStyle(['A'], 'A', () => 0)).toBe('A');
	});
});
```

**Step 2: Run the test to verify it fails**

Run: `bun run test:unit src/lib/landing-generator/parser.spec.ts --run`

Expected: FAIL because the landing-generator helper modules do not exist yet.

**Step 3: Write the minimal implementation**

Add `src/lib/landing-generator/types.ts` with exact exported shapes:

```ts
export type StyleOption = {
	id: number;
	name: string;
	description: string;
	category: 'core' | 'niche';
};

export type AccentOption = {
	id: string;
	name: string;
	description: string;
};

export type PaletteColor = {
	hex: string;
	role: 'Primary' | 'Secondary' | 'Accent' | 'Background' | 'Surface / Text';
	name: string;
};

export type Palette = {
	palette_name: string;
	mood: string;
	colors: PaletteColor[];
};

export type ParsedGeneration = {
	prompt: string;
	palette: Palette;
};
```

Add `src/lib/landing-generator/config.ts` with:

- exported `STYLE_OPTIONS` array containing all 15 styles from `landing-page-generator-spec.md`
- exported `ACCENT_OPTIONS` array containing all 6 accent overlays
- exported `FALLBACK_PALETTE` object with five valid colors and the required role names
- exported `MAX_HISTORY = 5`

Add `src/lib/landing-generator/prompt.ts` with:

- exported `SYSTEM_PROMPT` string copied from `landing-page-generator-spec.md`
- exported `buildGenerationInput(styleName: string, accentName?: string | null)` that returns the final user prompt text

Add `src/lib/landing-generator/parser.ts` with:

```ts
import type { Palette, ParsedGeneration } from './types';
import { FALLBACK_PALETTE } from './config';

const PALETTE_REGEX = /\{[\s\S]*"palette_name"[\s\S]*\}/;
const HEX_REGEX = /^#[0-9A-F]{6}$/i;
const REQUIRED_ROLES = ['Primary', 'Secondary', 'Accent', 'Background', 'Surface / Text'] as const;

function isPalette(value: unknown): value is Palette {
	if (!value || typeof value !== 'object') return false;
	const candidate = value as Palette;
	if (!candidate.palette_name || !candidate.mood || !Array.isArray(candidate.colors)) return false;
	if (candidate.colors.length !== 5) return false;
	return REQUIRED_ROLES.every((role) =>
		candidate.colors.some(
			(color) => color.role === role && HEX_REGEX.test(color.hex) && Boolean(color.name)
		)
	);
}

export function parseResponse(rawText: string): ParsedGeneration {
	const jsonMatch = rawText.match(PALETTE_REGEX);
	const prompt = rawText.replace(jsonMatch?.[0] ?? '', '').trim();

	if (!jsonMatch) {
		return { prompt, palette: FALLBACK_PALETTE };
	}

	try {
		const parsed = JSON.parse(jsonMatch[0]);
		return { prompt, palette: isPalette(parsed) ? parsed : FALLBACK_PALETTE };
	} catch {
		return { prompt, palette: FALLBACK_PALETTE };
	}
}
```

Add `src/lib/landing-generator/random.ts` with:

```ts
export function getCryptoIndex(length: number): number {
	const buffer = new Uint32Array(1);
	crypto.getRandomValues(buffer);
	return buffer[0] % length;
}

export function pickRandomStyle<T>(items: T[], lastItem: T | null, getIndex = getCryptoIndex): T {
	if (items.length === 0) {
		throw new Error('pickRandomStyle requires at least one item');
	}

	if (items.length === 1) {
		return items[0];
	}

	let next = items[getIndex(items.length)];
	while (next === lastItem) {
		next = items[getIndex(items.length)];
	}

	return next;
}
```

**Step 4: Run the tests to verify they pass**

Run: `bun run test:unit src/lib/landing-generator/parser.spec.ts --run`

Expected: PASS for parser validation and immediate-repeat random selection behavior.

**Step 5: Commit**

```bash
git add src/lib/landing-generator docs/plans/2026-03-10-landing-page-generator.md
git commit -m "feat: add landing generator core helpers"
```

If git is not initialized yet, skip this step and continue.

### Task 2: Add the secure FXZLY server proxy and request formatter

**Files:**

- Create: `src/lib/server/fxzly.ts`
- Create: `src/routes/api/generate/+server.ts`
- Test: `src/lib/landing-generator/parser.spec.ts`
- Modify: `.env.example`

**Step 1: Write the failing test**

Append a helper-level test that verifies the outgoing chat completion payload shape:

```ts
import { buildFxzlyRequestBody } from '$lib/server/fxzly';
import { SYSTEM_PROMPT } from './prompt';

it('builds the GPT request body from style and accent', () => {
	const body = buildFxzlyRequestBody('Swiss / Editorial Grid', 'Guided Scrolling');

	expect(body.model).toBe('gpt-5.4');
	expect(body.max_tokens).toBe(2000);
	expect(body.messages[0]).toEqual({ role: 'system', content: SYSTEM_PROMPT });
	expect(body.messages[1].content).toContain('Selected design style: Swiss / Editorial Grid');
	expect(body.messages[1].content).toContain('Interaction layer accent: Guided Scrolling');
});
```

**Step 2: Run the test to verify it fails**

Run: `bun run test:unit src/lib/landing-generator/parser.spec.ts --run`

Expected: FAIL because the server helper does not exist yet.

**Step 3: Write the minimal implementation**

Create `src/lib/server/fxzly.ts` with:

```ts
import { FXZLY_API_KEY } from '$env/static/private';
import { SYSTEM_PROMPT, buildGenerationInput } from '$lib/landing-generator/prompt';

const ENDPOINT = 'https://api.fxzly.my/v1/chat/completions';

export function buildFxzlyRequestBody(styleName: string, accentName?: string | null) {
	return {
		model: 'gpt-5.4',
		max_tokens: 2000,
		messages: [
			{ role: 'system', content: SYSTEM_PROMPT },
			{ role: 'user', content: buildGenerationInput(styleName, accentName) }
		]
	};
}

export async function requestLandingPrompt(
	fetchImpl: typeof fetch,
	styleName: string,
	accentName?: string | null
) {
	if (!FXZLY_API_KEY?.trim()) {
		throw new Error('FXZLY_API_KEY is not configured');
	}

	const response = await fetchImpl(ENDPOINT, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${FXZLY_API_KEY}`
		},
		body: JSON.stringify(buildFxzlyRequestBody(styleName, accentName))
	});

	if (!response.ok) {
		throw new Error(`FXZLY request failed: ${response.status}`);
	}

	const data = await response.json();
	const content = data.choices?.[0]?.message?.content;
	if (!content?.trim()) {
		throw new Error('FXZLY response missing message content');
	}

	return content;
}
```

Create `src/routes/api/generate/+server.ts` with a `POST` handler that:

- reads `{ style, accent }` from the request body
- returns `json({ message: 'Invalid request body' }, { status: 400 })` if the body is malformed JSON
- validates that `style` is present
- calls `requestLandingPrompt(fetch, style, accent)`
- returns `json({ rawText })`
- returns `json({ message: 'Unable to generate prompt' }, { status: 502 })` on upstream failure

Create `.env.example` with:

```dotenv
FXZLY_API_KEY=your_private_key_here
```

**Step 4: Run the tests to verify they pass**

Run: `bun run test:unit src/lib/landing-generator/parser.spec.ts --run`

Expected: PASS for payload formatting and existing helper tests.

**Step 5: Commit**

```bash
git add src/lib/server/fxzly.ts src/routes/api/generate/+server.ts .env.example
git commit -m "feat: add secure fxzly generation endpoint"
```

If git is not initialized yet, skip this step and continue.

### Task 3: Build the single-page generator UI with style picker, surprise flow, loading state, output, and history

**Files:**

- Create: `src/lib/components/landing-generator/StyleCard.svelte`
- Create: `src/lib/components/landing-generator/AccentPill.svelte`
- Create: `src/lib/components/landing-generator/LoadingSkeleton.svelte`
- Create: `src/lib/components/landing-generator/PaletteSwatches.svelte`
- Create: `src/lib/components/landing-generator/HistoryStrip.svelte`
- Modify: `src/routes/+page.svelte`
- Test: `src/routes/page.svelte.spec.ts`

**Step 1: Write the failing tests**

Replace `src/routes/page.svelte.spec.ts` with browser tests that verify:

```ts
import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	it('renders the style picker and surprise button', async () => {
		render(Page);

		await expect
			.element(page.getByRole('heading', { name: /landing page generator/i }))
			.toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: /surprise me/i })).toBeInTheDocument();
		await expect.element(page.getByText(/swiss \/ editorial grid/i)).toBeInTheDocument();
	});

	it('locks in a selected style and enables generation', async () => {
		render(Page);

		await page.getByRole('button', { name: /minimal \/ luxury minimal/i }).click();
		await expect.element(page.getByRole('button', { name: /generate prompt/i })).toBeEnabled();
		await expect.element(page.getByText(/selected style/i)).toBeInTheDocument();
	});
});
```

Add a second test after the main UI is in place:

```ts
it('renders generated prompt text and palette after a successful request', async () => {
	vi.stubGlobal(
		'fetch',
		vi.fn(async () => ({
			ok: true,
			json: async () => ({
				rawText: `Paragraph one.\n\nParagraph two.\n\nParagraph three.\n\n{
			  "palette_name": "Quiet Current",
			  "mood": "Calm and precise.",
			  "colors": [
			    { "hex": "#112233", "role": "Primary", "name": "Ink" },
			    { "hex": "#445566", "role": "Secondary", "name": "Fog" },
			    { "hex": "#778899", "role": "Accent", "name": "Mist" },
			    { "hex": "#F5F3EE", "role": "Background", "name": "Paper" },
			    { "hex": "#111111", "role": "Surface / Text", "name": "Charcoal" }
			  ]
			}`
			})
		}))
	);

	render(Page);
	await page.getByRole('button', { name: /swiss \/ editorial grid/i }).click();
	await page.getByRole('button', { name: /generate prompt/i }).click();

	await expect.element(page.getByText(/paragraph one/i)).toBeInTheDocument();
	await expect.element(page.getByText(/quiet current/i)).toBeInTheDocument();
	await expect.element(page.getByText(/primary/i)).toBeInTheDocument();
});
```

**Step 2: Run the test to verify it fails**

Run: `bun run test:unit src/routes/page.svelte.spec.ts --run`

Expected: FAIL because the route still contains the starter content.

**Step 3: Write the minimal implementation**

Create `src/lib/components/landing-generator/StyleCard.svelte` with props:

- `option`
- `selected`
- `onclick`

Render a full-width accessible button with the style name and descriptor.

Create `src/lib/components/landing-generator/AccentPill.svelte` with props:

- `option`
- `selected`
- `onclick`

Render a compact toggle button for optional accents.

Create `src/lib/components/landing-generator/LoadingSkeleton.svelte` with 3 shimmering paragraph bars and 5 palette placeholders.

Create `src/lib/components/landing-generator/PaletteSwatches.svelte` that receives a validated palette and renders:

- palette name
- mood sentence
- five labeled swatches with inline `background-color`

Create `src/lib/components/landing-generator/HistoryStrip.svelte` that receives the last five results and lets the user re-open a prior entry.

Replace `src/routes/+page.svelte` with a rune-based page using this exact state model:

```svelte
<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { STYLE_OPTIONS, ACCENT_OPTIONS, MAX_HISTORY } from '$lib/landing-generator/config';
	import { parseResponse } from '$lib/landing-generator/parser';
	import { pickRandomStyle } from '$lib/landing-generator/random';
	import type { AccentOption, ParsedGeneration, StyleOption } from '$lib/landing-generator/types';

	let selectedStyle = $state<StyleOption | null>(null);
	let selectedAccent = $state<AccentOption | null>(null);
	let isGenerating = $state(false);
	let isShuffling = $state(false);
	let errorMessage = $state('');
	let result = $state<ParsedGeneration | null>(null);
	let history = $state<{ style: string; accent: string | null; output: ParsedGeneration }[]>([]);
	let lastRandomStyle = $state<string | null>(null);

	const canGenerate = $derived(Boolean(selectedStyle) && !isGenerating);
</script>
```

Implement these functions in `src/routes/+page.svelte`:

- `selectStyle(option)` sets `selectedStyle`
- `toggleAccent(option)` toggles `selectedAccent`
- `surpriseMe()` sets `isShuffling`, cycles through quick temporary labels for ~600ms, then uses `pickRandomStyle(STYLE_OPTIONS, selectedStyle, ...)`, assigns `selectedStyle`, updates `lastRandomStyle`, and clears `isShuffling`
- `generatePrompt()` posts to `/api/generate`, parses `rawText`, updates `result`, prepends to `history`, and trims `history` to `MAX_HISTORY`
- `regenerate()` calls `generatePrompt()` again with the same selected style/accent
- `copyPrompt()` writes prompt text to `navigator.clipboard`
- `exportJson()` downloads a `.json` blob with style, accent, prompt, and palette

Render in this order:

- hero heading, subcopy, and trust note about accessible performant prompts
- style selection grid using `StyleCard`
- optional interaction accent row using `AccentPill`
- confirm-selection panel with selected style descriptor
- CTA row with `Generate Prompt`, `Surprise Me`, and `Regenerate`
- loading skeleton while generating
- error alert when the request fails
- output card with three-paragraph prompt, palette swatches, copy/export buttons
- history strip for the last five generations

Use transitions sparingly:

- `transition:fly={{ y: 18, duration: 250 }}` for result panel entry
- `transition:fade={{ duration: 180 }}` for loading and confirm blocks

**Step 4: Run the tests to verify they pass**

Run: `bun run test:unit src/routes/page.svelte.spec.ts --run`

Expected: PASS for the style picker, selection state, and successful render after generation.

**Step 5: Commit**

```bash
git add src/routes/+page.svelte src/routes/page.svelte.spec.ts src/lib/components/landing-generator
git commit -m "feat: build landing page generator interface"
```

If git is not initialized yet, skip this step and continue.

### Task 4: Add the visual system, metadata, and accessibility polish

**Files:**

- Modify: `src/routes/layout.css`
- Modify: `src/routes/+page.svelte`
- Modify: `src/app.html`
- Test: `src/routes/page.svelte.spec.ts`

**Step 1: Write the failing test**

Add assertions to `src/routes/page.svelte.spec.ts` for:

```ts
it('includes a descriptive page title and accessible status copy', async () => {
	render(Page);

	await expect
		.element(page.getByText(/accessibility and performance are built in/i))
		.toBeInTheDocument();
	expect(document.title).toMatch(/landing page generator/i);
});
```

**Step 2: Run the test to verify it fails**

Run: `bun run test:unit src/routes/page.svelte.spec.ts --run`

Expected: FAIL because the page metadata and final copy are not added yet.

**Step 3: Write the minimal implementation**

Update `src/routes/+page.svelte` to include:

```svelte
<svelte:head>
	<title>Landing Page Generator</title>
	<meta
		name="description"
		content="Generate emotionally rich landing page prompts and production-ready color palettes from curated design styles."
	/>
</svelte:head>
```

Update `src/routes/layout.css` with:

- CSS custom properties for the page palette (`--bg`, `--surface`, `--line`, `--text`, `--muted`, `--accent`, `--accent-soft`)
- a layered background using radial gradients and a subtle grid texture
- base typography and body colors
- utility classes used by the route such as `.glass-panel`, `.eyebrow`, `.section-title`, `.shimmer`, and `.sr-only`

Keep the look intentional but not off-brand for a productivity/design tool:

- warm neutral background
- deep ink text
- copper or teal accent, not purple
- clear desktop/mobile spacing

Update `src/app.html` so the document language remains explicitly English:

```html
<html lang="en"></html>
```

In `src/routes/+page.svelte`, ensure:

- every interactive control is a native `<button>`
- loading state uses `aria-busy="true"`
- error state uses `role="alert"`
- selected states expose `aria-pressed`
- the output region has an accessible heading

**Step 4: Run the tests and checks to verify they pass**

Run: `bun run test:unit src/routes/page.svelte.spec.ts --run && bun run check`

Expected: PASS for page metadata, accessible copy, and type/a11y checks.

**Step 5: Commit**

```bash
git add src/routes/+page.svelte src/routes/layout.css src/app.html
git commit -m "style: add landing generator visual system and metadata"
```

If git is not initialized yet, skip this step and continue.

### Task 5: Final verification and cleanup

**Files:**

- Modify: `README.md`

**Step 1: Write the failing documentation check**

Identify the missing setup instructions in `README.md`:

- how to create `.env` from `.env.example`
- required `FXZLY_API_KEY`
- how to run dev, check, and test commands

**Step 2: Run the current checks to establish a baseline**

Run: `bun run check && bun run test`

Expected: PASS on code, FAIL only if docs are intentionally incomplete.

**Step 3: Write the minimal documentation**

Add a short section to `README.md`:

```md
## Landing Page Generator

1. Copy `.env.example` to `.env`
2. Set `FXZLY_API_KEY`
3. Run `bun run dev`

Verification:

- `bun run check`
- `bun run test`
```

**Step 4: Run final verification**

Run: `bun run check && bun run test && bun run build`

Expected: PASS for type checking, browser tests, and production build.

**Step 5: Commit**

```bash
git add README.md
git commit -m "docs: add landing generator setup instructions"
```

If git is not initialized yet, skip this step.
