# Landing Page Generator - Master Prompt & System Specification

---

## Overview

This document defines the full system prompt, UI flow, API integration spec, and generation instructions for the **Landing Page Design Prompt Generator** - a Svelte-based single-page app that uses GPT-5.4 (via `api.fxzly.my`) to generate rich, style-specific landing page creation prompts with color palette suggestions.

---

## Application Flow

```text
User arrives
    |
    v
[Style Selection Screen]
    |-- Browse & select a design style manually
    |       '-- Click style card -> style is locked in
    '-- Click "Surprise Me" button
            '-- True random selection (see randomization rules below)
    |
    v
[Confirm Selection]
    '-- Show selected style name + one-line descriptor
    '-- "Generate Prompt" CTA button
    |
    v
[API Call to GPT-5.4]
    '-- POST -> https://api.fxzly.my/v1/chat/completions
    '-- Model: gpt-5.4 (or latest available via router)
    '-- Auth: Bearer [API_KEY]
    '-- Payload: system prompt (below) + user style selection
    |
    v
[Output Screen]
    |-- Generated 3-paragraph landing page prompt
    |-- Suggested color palette (5 swatches with hex codes + role labels)
    '-- Copy / Export / Regenerate options
```

---

## Randomization Rules - "Surprise Me"

> **CRITICAL:** The randomization must be genuinely unpredictable. Do NOT weight toward any default style. Implement as follows in Svelte:

```javascript
// In your Svelte component
function getTrueRandom(arr) {
	// Use crypto.getRandomValues for true randomness, not Math.random()
	const randomBuffer = new Uint32Array(1);
	crypto.getRandomValues(randomBuffer);
	const index = randomBuffer[0] % arr.length;
	return arr[index];
}
```

- Pull from the **full flat list** of all 15 core + niche styles (do not exclude any)
- On consecutive "Surprise Me" clicks, enforce no immediate repeat (track last selection in component state)
- The selected style must be visually revealed with a brief "spinning/shuffling" animation before landing to reinforce true randomness feel

---

## Svelte API Integration

```javascript
// api.js - call from your Svelte component
export async function generateLandingPrompt(selectedStyle, interactionAccent = null) {
	const response = await fetch('https://api.fxzly.my/v1/chat/completions', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${import.meta.env.VITE_FXZLY_API_KEY}`
		},
		body: JSON.stringify({
			model: 'gpt-5.4',
			max_tokens: 2000,
			messages: [
				{ role: 'system', content: SYSTEM_PROMPT },
				{
					role: 'user',
					content: `Selected design style: ${selectedStyle}${interactionAccent ? `\nInteraction layer accent: ${interactionAccent}` : ''}\n\nGenerate the landing page prompt and color palette now.`
				}
			]
		})
	});

	const data = await response.json();
	return data.choices[0].message.content;
}
```

Store your API key in `.env`:

```dotenv
VITE_FXZLY_API_KEY=your_key_here
```

---

## System Prompt (inject as `role: system`)

```text
You are a world-class creative director and UX strategist specializing in high-impact web design. Your role is to generate richly detailed, emotionally evocative landing page creation prompts for a given design style, followed by a curated color palette recommendation.

When the user provides a design style (and optionally an interaction layer accent), you will output TWO sections in your response:

---

SECTION 1: LANDING PAGE PROMPT
Output exactly three paragraphs following the instructions below. Do not add headers, labels, or extra text - just the three paragraphs as a clean block of prose.

SECTION 2: COLOR PALETTE
After the three paragraphs, output a color palette in the following JSON format only - no extra explanation:

{
  "palette_name": "A poetic 2-4 word name for this palette",
  "mood": "One sentence describing the emotional quality of this palette",
  "colors": [
    { "hex": "#XXXXXX", "role": "Primary", "name": "Descriptive color name" },
    { "hex": "#XXXXXX", "role": "Secondary", "name": "Descriptive color name" },
    { "hex": "#XXXXXX", "role": "Accent", "name": "Descriptive color name" },
    { "hex": "#XXXXXX", "role": "Background", "name": "Descriptive color name" },
    { "hex": "#XXXXXX", "role": "Surface / Text", "name": "Descriptive color name" }
  ]
}

---

PARAGRAPH WRITING INSTRUCTIONS:

Paragraph 1: State the chosen visual family and any interaction layer accent, then conceive an innovative business or service concept for a single-page landing page. Describe the core emotional qualities this style evokes - what mood should visitors experience on arrival? How should the visual hierarchy and scroll flow make them feel as they move through the page? Note how color, texture, or depth should reflect the chosen style's emotional signature - whether that means restraint, richness, warmth, or bold chromatic confidence.

Paragraph 2: Explain the design philosophy through emotion and user experience. How should typography feel - authoritative, welcoming, raw, soft, cutting-edge? What sensation should interactions and animations create - liquid and continuous, snappy and precise, gentle and organic, or dramatic and choreographed? Describe how the single-page journey should emotionally progress from first impression through final call-to-action, creating a complete narrative arc. If an interaction layer accent was provided, describe how it amplifies the emotional quality of the base style rather than competing with it.

Paragraph 3: Provide abstract reference points that capture the aesthetic's essence - spaces, cultural movements, artistic periods, architectural styles, material qualities, or design philosophies. Reference emotional qualities of premium experiences, sophisticated environments, tactile craftsmanship, or distinctly human moments. Explain how these abstract references should influence the visual sophistication of the final design without naming specific brands or platforms. Close by reinforcing that the result must feel like one unified emotional statement - not a collection of sections - that begins with arrival and ends with the desire to act.

---

RULES:
- This is ONE COHESIVE LANDING PAGE with a single scrolling experience
- Focus on feeling, atmosphere, and abstract quality - not technical specs
- Accessibility and performance are non-negotiable constraints beneath every style
- Keep all references conceptual and high-level for maximum creative interpretation
- Color palette must be harmonious, on-brand for the chosen style, and production-ready (WCAG AA contrast minimum between Background and Surface/Text roles)
```

---

## Design Style Reference List

Use this full list for both the UI style picker and the randomization pool.

### Core Visual Families

| ID  | Style                            | One-line descriptor                                                       |
| --- | -------------------------------- | ------------------------------------------------------------------------- |
| 1   | Swiss / Editorial Grid           | Systematic grid, precise hierarchy, ultra-clean typography                |
| 2   | Minimal / Luxury Minimal         | Premium restraint, maximum whitespace, essential only                     |
| 3   | Typography First                 | Type as the hero, letterforms as the primary design system                |
| 4   | Nature Distilled                 | Warm minimalism, organic calm, Japandi-evolved, tactile natural materials |
| 5   | Tactile Maximalism               | Layered richness, bold color, textural depth, sensory abundance           |
| 6   | Retrofuturism                    | Dial-up nostalgia meets forward momentum, refined retro-tech aesthetic    |
| 7   | Elevated Brutalism / Anti-Design | Raw confrontational structure with intentional sophistication             |
| 8   | Hyperreal / Immersive 3D         | Photorealistic depth, dimensional environments, spatial UI                |
| 9   | Handmade Collage                 | Craft-forward, analog texture, human imperfection as beauty               |
| 10  | Ambient Tech / AI-Forward        | Soft intelligence, gradient warmth, fluid system-level thinking           |
| 11  | Adaptive Dark Mode               | High contrast elegance, designed-for-dark sophistication                  |
| 12  | Corporate Professional           | Trust-building authority, refined establishment, confident clarity        |

### Niche / Substyles

| ID  | Style                           | One-line descriptor                                              |
| --- | ------------------------------- | ---------------------------------------------------------------- |
| 13  | Heritage Editorial / Museumcore | Luxury cultural gravitas, archival sophistication                |
| 14  | Neumorphic                      | Soft extruded surfaces, tactile product UI, refined fintech feel |
| 15  | Dopamine / Hypercolor           | Saturated joy, Gen Z energy, unapologetic chromatic boldness     |

### Interaction Layer Accents _(optional overlay - shown as secondary picker)_

| ID  | Accent                                     | Description                                                       |
| --- | ------------------------------------------ | ----------------------------------------------------------------- |
| A   | Dynamic Text Treatments                    | Type that moves, shifts, or reveals as part of the narrative      |
| B   | Guided Scrolling                           | Page choreographs the journey; motion reveals story progressively |
| C   | Experimental Navigation                    | Spatial, non-linear, or unconventional wayfinding                 |
| D   | Motion / Micro-interactions                | Precise, purposeful animation that rewards attention              |
| E   | AI Assistant Patterns                      | Conversational UI elements woven into the visual language         |
| F   | Sustainable / Accessible Performance-First | Restraint and inclusion as aesthetic virtues                      |

---

## Output Parsing (Svelte)

The GPT response will contain two sections. Parse them like this:

```javascript
function parseResponse(rawText) {
	// Split at the JSON block
	const jsonMatch = rawText.match(/\{[\s\S]*"palette_name"[\s\S]*\}/);
	const promptText = rawText.replace(jsonMatch?.[0] || '', '').trim();

	let palette = null;
	if (jsonMatch) {
		try {
			palette = JSON.parse(jsonMatch[0]);
		} catch (e) {
			console.error('Palette parse error:', e);
		}
	}

	return { prompt: promptText, palette };
}
```

Render the 5 palette colors as swatches with hex codes and role labels directly below the generated prompt text.

---

## Notes

- Always pass `VITE_FXZLY_API_KEY` via environment variable - never hardcode
- Add a loading skeleton/shimmer state in Svelte while awaiting the API response
- The "Regenerate" button should re-call the API with the same style, producing a fresh variation
- Consider caching the last 5 generated prompts in Svelte component state so users can browse back
- The color palette JSON must always be validated before rendering - fall back to a neutral 5-color set if parsing fails
