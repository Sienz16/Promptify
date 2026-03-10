import { describe, expect, it } from 'vitest';

import { buildApiRequestBody } from '$lib/server/api';
import { STYLE_OPTIONS } from './config';
import { FALLBACK_PALETTE } from './config';
import { buildMarkdownPrompt } from './markdown-prompt';
import { SYSTEM_PROMPT } from './prompt';
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

	it('ignores braces in prose before the final palette JSON block', () => {
		const raw = `Paragraph one introduces a concept called {North Star}.\n\nParagraph two says the flow should feel {measured} and calm.\n\nParagraph three closes the story.\n\n{
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

		expect(result.prompt).toContain('{North Star}');
		expect(result.prompt).toContain('{measured}');
		expect(result.palette.palette_name).toBe('Quiet Current');
	});

	it('falls back when palette JSON is syntactically valid but missing required roles', () => {
		const result = parseResponse(`Paragraph one.\n\nParagraph two.\n\nParagraph three.\n\n{
		  "palette_name": "Broken Spectrum",
		  "mood": "Still parses as JSON.",
		  "colors": [
		    { "hex": "#112233", "role": "Primary", "name": "Ink" },
		    { "hex": "#445566", "role": "Secondary", "name": "Fog" },
		    { "hex": "#778899", "role": "Accent", "name": "Mist" },
		    { "hex": "#F5F3EE", "role": "Background", "name": "Paper" },
		    { "hex": "#111111", "role": "Background", "name": "Shadow" }
		  ]
		}`);

		expect(result.prompt.split('\n\n')).toHaveLength(3);
		expect(result.palette).toEqual(FALLBACK_PALETTE);
	});

	it('falls back when palette JSON uses invalid hex values', () => {
		const result = parseResponse(`Paragraph one.\n\nParagraph two.\n\nParagraph three.\n\n{
		  "palette_name": "Broken Spectrum",
		  "mood": "Still parses as JSON.",
		  "colors": [
		    { "hex": "#11223Z", "role": "Primary", "name": "Ink" },
		    { "hex": "#445566", "role": "Secondary", "name": "Fog" },
		    { "hex": "#778899", "role": "Accent", "name": "Mist" },
		    { "hex": "#F5F3EE", "role": "Background", "name": "Paper" },
		    { "hex": "#111111", "role": "Surface / Text", "name": "Charcoal" }
		  ]
		}`);

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

describe('buildApiRequestBody', () => {
	it('builds the GPT request body from style and accent', () => {
		const body = buildApiRequestBody('Swiss / Editorial Grid', 'Guided Scrolling');

		expect(body.model).toBe('gpt-5.4');
		expect(body.max_tokens).toBe(2000);
		expect(body.messages[0]).toEqual({ role: 'system', content: SYSTEM_PROMPT });
		expect(body.messages[1].content).toContain('Selected design style: Swiss / Editorial Grid');
		expect(body.messages[1].content).toContain('Interaction layer accent: Guided Scrolling');
	});
});

describe('buildMarkdownPrompt', () => {
	it('builds a production-ready markdown prompt with clear sections', () => {
		const result = parseResponse(`Paragraph one.\n\nParagraph two.\n\nParagraph three.\n\n{
		  "palette_name": "Quiet Current",
		  "mood": "Calm and precise.",
		  "colors": [
		    { "hex": "#112233", "role": "Primary", "name": "Ink" },
		    { "hex": "#445566", "role": "Secondary", "name": "Fog" },
		    { "hex": "#778899", "role": "Accent", "name": "Mist" },
		    { "hex": "#F5F3EE", "role": "Background", "name": "Paper" },
		    { "hex": "#111111", "role": "Surface / Text", "name": "Charcoal" }
		  ]
		}`);

		const markdownPrompt = buildMarkdownPrompt({
			style: STYLE_OPTIONS[0],
			accent: 'Guided Scrolling',
			result
		});

		expect(markdownPrompt).toContain('# Role');
		expect(markdownPrompt).toContain('# Design Logic');
		expect(markdownPrompt).toContain('Paragraph one.');
		expect(markdownPrompt).toContain('# Color Palette');
		expect(markdownPrompt).toContain('- Palette name: Quiet Current');
		expect(markdownPrompt).toContain('| Primary | Ink | #112233 |');
		expect(markdownPrompt).toContain('# Build Instructions');
		expect(markdownPrompt).toContain('Use semantic landmarks');
		expect(markdownPrompt).toContain('# Output Expectations');
		expect(markdownPrompt).toContain('Swiss / Editorial Grid');
		expect(markdownPrompt).toContain('Guided Scrolling');
	});
});
