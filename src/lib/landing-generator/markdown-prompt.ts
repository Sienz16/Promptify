import type { ParsedGeneration, StyleOption } from './types';

type BuildMarkdownPromptInput = {
	style: StyleOption;
	accent: string | null;
	result: ParsedGeneration;
};

function formatPaletteRows(result: ParsedGeneration) {
	return result.palette.colors
		.map((color) => `| ${color.role} | ${color.name} | ${color.hex.toUpperCase()} |`)
		.join('\n');
}

export function buildMarkdownPrompt({ style, accent, result }: BuildMarkdownPromptInput): string {
	const accentLine = accent ? `- Interaction accent: ${accent}` : '- Interaction accent: None';

	return [
		'# Role',
		'',
		'You are a senior product designer and front-end engineer building a premium, conversion-focused landing page. Deliver a polished, production-ready experience that feels distinctive, fast, accessible, and visually cohesive from hero to final call to action.',
		'',
		'# Design Logic',
		'',
		`- Base style: ${style.name}`,
		`- Style intent: ${style.description}`,
		accentLine,
		'',
		result.prompt,
		'',
		'# Color Palette',
		'',
		`- Palette name: ${result.palette.palette_name}`,
		`- Mood: ${result.palette.mood}`,
		'',
		'| Role | Name | Hex |',
		'| --- | --- | --- |',
		formatPaletteRows(result),
		'',
		'# Build Instructions',
		'',
		'- Build a single-page landing experience with a strong hero, persuasive narrative flow, social proof or trust-building detail, and a clear closing call to action.',
		'- Use semantic landmarks, accessible heading structure, visible focus states, descriptive alt text, and color contrast that meets WCAG AA at minimum.',
		'- Translate the design logic into a premium visual system with intentional typography, spacing, motion, and section transitions; avoid generic templates and default styling.',
		'- Optimize for performance with efficient assets, restrained JavaScript, responsive layouts, and motion that enhances clarity without blocking interaction.',
		'- Ensure the page feels cohesive on mobile and desktop, with refined behavior for hover, focus, and reduced-motion preferences.',
		'',
		'# Output Expectations',
		'',
		'- Return implementation-ready code for the landing page, including the structure, styling, and any small interaction details needed to ship the experience.',
		'- Use the palette directly in the build and keep the final result aligned with the emotional tone described in the design logic.',
		'- Do not restate the brief; produce the build output.'
	].join('\n');
}
