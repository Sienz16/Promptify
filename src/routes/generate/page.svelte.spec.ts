import { page } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

const RAW_TEXT = `Paragraph one.\n\nParagraph two.\n\nParagraph three.\n\n{
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

function createFetchResponse(rawText: string) {
	return {
		ok: true,
		json: async () => ({ rawText })
	};
}

afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

describe('/generate/+page.svelte', () => {
	it('organizes generated output into brief, palette, and developer handoff sections', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => createFetchResponse(RAW_TEXT))
		);

		render(Page);

		await page.getByRole('button', { name: /swiss \/ editorial grid/i }).click();
		await page.getByRole('button', { name: /next stage/i }).click();
		await page.getByRole('button', { name: /generate plain style/i }).click();

		await expect
			.element(page.getByRole('heading', { name: /generated brief/i }))
			.toBeInTheDocument();
		await expect
			.element(page.getByRole('heading', { name: /palette system/i }))
			.toBeInTheDocument();
		await expect
			.element(page.getByRole('heading', { name: /developer handoff/i }))
			.toBeInTheDocument();
		await expect.element(page.getByText('Paragraph one.', { exact: true })).toBeInTheDocument();
		await expect.element(page.getByRole('heading', { name: 'Quiet Current' })).toBeInTheDocument();
	});

	it('copies the entire markdown handoff from the developer handoff card', async () => {
		const writeText = vi.fn(async () => undefined);

		vi.stubGlobal(
			'fetch',
			vi.fn(async () => createFetchResponse(RAW_TEXT))
		);
		vi.stubGlobal('navigator', {
			clipboard: { writeText }
		});

		render(Page);

		await page.getByRole('button', { name: /swiss \/ editorial grid/i }).click();
		await page.getByRole('button', { name: /next stage/i }).click();
		await page.getByRole('button', { name: /generate plain style/i }).click();
		await page.getByRole('button', { name: /copy markdown/i }).click();

		expect(writeText).toHaveBeenCalledWith(expect.stringContaining('# Role'));
		expect(writeText).toHaveBeenCalledWith(expect.stringContaining('Swiss / Editorial Grid'));
	});
});
