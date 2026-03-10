import { page } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { MAX_HISTORY } from '$lib/landing-generator/config';
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

const SECOND_RAW_TEXT = `Another opening paragraph.\n\nSecond block.\n\nThird block.\n\n{
  "palette_name": "Bright Loom",
  "mood": "Energetic and crisp.",
  "colors": [
    { "hex": "#2A3344", "role": "Primary", "name": "Forge" },
    { "hex": "#64748B", "role": "Secondary", "name": "Slate" },
    { "hex": "#F97316", "role": "Accent", "name": "Signal" },
    { "hex": "#FFF7ED", "role": "Background", "name": "Shell" },
    { "hex": "#111827", "role": "Surface / Text", "name": "Depth" }
  ]
}`;

function createFetchResponse(rawText: string, ok = true, message = 'Unable to generate prompt') {
	return {
		ok,
		json: async () => (ok ? { rawText } : { message })
	};
}

function createRawText(label: string) {
	return `${label} intro.\n\n${label} middle.\n\n${label} finale.\n\n{
  "palette_name": "${label} Palette",
  "mood": "${label} mood.",
  "colors": [
    { "hex": "#112233", "role": "Primary", "name": "Ink" },
    { "hex": "#445566", "role": "Secondary", "name": "Fog" },
    { "hex": "#778899", "role": "Accent", "name": "Mist" },
    { "hex": "#F5F3EE", "role": "Background", "name": "Paper" },
    { "hex": "#111111", "role": "Surface / Text", "name": "Charcoal" }
  ]
}`;
}

afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
	vi.useRealTimers();
});

describe('/+page.svelte', () => {
	it('renders the style picker and surprise button', async () => {
		render(Page);

		await expect
			.element(page.getByRole('heading', { name: /landing page generator/i }))
			.toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: /surprise me/i })).toBeInTheDocument();
		await expect.element(page.getByText(/swiss \/ editorial grid/i)).toBeInTheDocument();
	});

	it('includes a descriptive page title and accessible status copy', async () => {
		render(Page);

		await expect
			.element(page.getByText(/accessibility and performance are built in/i))
			.toBeInTheDocument();
		expect(document.title).toMatch(/landing page generator/i);
	});

	it('locks in a selected style, toggles accents, and enables generation', async () => {
		render(Page);

		const accentButton = page.getByRole('button', { name: /guided scrolling/i });
		await page.getByRole('button', { name: /minimal \/ luxury minimal/i }).click();
		await accentButton.click();

		await expect.element(page.getByRole('button', { name: /generate prompt/i })).toBeEnabled();
		await expect.element(page.getByText(/selected style/i)).toBeInTheDocument();
		await expect.element(page.getByText(/selected accent: guided scrolling/i)).toBeInTheDocument();
		await expect.element(accentButton).toHaveAttribute('aria-pressed', 'true');

		await accentButton.click();

		await expect.element(accentButton).toHaveAttribute('aria-pressed', 'false');
		await expect
			.element(page.getByText(/selected accent: guided scrolling/i))
			.not.toBeInTheDocument();
	});

	it('announces loading and hits /api/generate before rendering parsed output', async () => {
		let resolveFetch: ((value: ReturnType<typeof createFetchResponse>) => void) | undefined;
		const fetchMock = vi.fn(
			() =>
				new Promise<ReturnType<typeof createFetchResponse>>((resolve) => {
					resolveFetch = resolve;
				})
		);
		vi.stubGlobal('fetch', fetchMock);

		render(Page);
		await page.getByRole('button', { name: /swiss \/ editorial grid/i }).click();
		await page.getByRole('button', { name: /generate prompt/i }).click();

		expect(fetchMock).toHaveBeenCalledWith(
			'/api/generate',
			expect.objectContaining({
				method: 'POST'
			})
		);
		await expect.element(page.getByRole('status')).toHaveTextContent(/generating prompt/i);
		await expect
			.element(page.getByText(/loading generated prompt and palette/i))
			.toBeInTheDocument();

		resolveFetch?.(createFetchResponse(RAW_TEXT));

		await expect.element(page.getByText('Paragraph one.', { exact: true })).toBeInTheDocument();
		await expect.element(page.getByRole('heading', { name: 'Quiet Current' })).toBeInTheDocument();
		await expect.element(page.getByText(/^primary$/i)).toBeInTheDocument();
	});

	it('renders an error alert when generation fails', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => createFetchResponse('', false, 'Upstream unavailable'))
		);

		render(Page);
		await page.getByRole('button', { name: /swiss \/ editorial grid/i }).click();
		await page.getByRole('button', { name: /generate prompt/i }).click();

		await expect.element(page.getByRole('alert')).toHaveTextContent(/upstream unavailable/i);
	});

	it('falls back to a stable user-facing error when an error response is not json', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => ({
				ok: false,
				json: async () => {
					throw new SyntaxError('Unexpected end of JSON input');
				}
			}))
		);

		render(Page);
		await page.getByRole('button', { name: /swiss \/ editorial grid/i }).click();
		await page.getByRole('button', { name: /generate prompt/i }).click();

		await expect.element(page.getByRole('alert')).toHaveTextContent(/unable to generate prompt/i);
		await expect
			.element(page.getByRole('alert'))
			.not.toHaveTextContent(/unexpected end of json input/i);
	});

	it('shuffles to a new style using the current selected style to avoid an immediate repeat', async () => {
		vi.spyOn(globalThis.crypto, 'getRandomValues').mockImplementation((array) => {
			const values = array as Uint32Array;
			values[0] = 0;
			return array;
		});

		render(Page);
		await page.getByRole('button', { name: /swiss \/ editorial grid/i }).click();
		await page.getByRole('button', { name: /^surprise me$/i }).click();

		await expect.element(page.getByRole('button', { name: /generate prompt/i })).toBeEnabled();
		await expect.element(page.getByText(/selected style/i)).toBeInTheDocument();
		await expect
			.element(page.getByRole('heading', { name: /minimal \/ luxury minimal/i }))
			.toBeInTheDocument();
	});

	it('reopens a previous history entry', async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(createFetchResponse(RAW_TEXT))
			.mockResolvedValueOnce(createFetchResponse(SECOND_RAW_TEXT));
		vi.stubGlobal('fetch', fetchMock);

		render(Page);

		await page.getByRole('button', { name: /swiss \/ editorial grid/i }).click();
		await page.getByRole('button', { name: /generate prompt/i }).click();
		await expect.element(page.getByText('Paragraph one.', { exact: true })).toBeInTheDocument();

		await page.getByRole('button', { name: /minimal \/ luxury minimal/i }).click();
		await page.getByRole('button', { name: /generate prompt/i }).click();
		await expect
			.element(page.getByText('Another opening paragraph.', { exact: true }))
			.toBeInTheDocument();

		await page.getByRole('button', { name: /swiss \/ editorial grid.*open saved result/i }).click();

		await expect.element(page.getByText('Paragraph one.', { exact: true })).toBeInTheDocument();
		await expect.element(page.getByRole('heading', { name: 'Quiet Current' })).toBeInTheDocument();
		await expect
			.element(page.getByRole('heading', { name: /swiss \/ editorial grid/i }))
			.toBeInTheDocument();
	});

	it('copies the generated prompt text', async () => {
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
		await page.getByRole('button', { name: /generate prompt/i }).click();
		await page.getByRole('button', { name: /copy prompt/i }).click();

		expect(writeText).toHaveBeenCalledWith('Paragraph one.\n\nParagraph two.\n\nParagraph three.');
	});

	it('renders and copies the markdown prompt text', async () => {
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
		await page.getByRole('button', { name: /guided scrolling/i }).click();
		await page.getByRole('button', { name: /generate prompt/i }).click();

		await expect
			.element(page.getByRole('heading', { name: /production-ready markdown prompt/i }))
			.toBeInTheDocument();
		await expect.element(page.getByText(/# role/i)).toBeInTheDocument();
		await expect.element(page.getByText(/# build instructions/i)).toBeInTheDocument();

		await page.getByRole('button', { name: /copy markdown prompt/i }).click();

		expect(writeText).toHaveBeenCalledWith(expect.stringContaining('# Role'));
		expect(writeText).toHaveBeenCalledWith(expect.stringContaining('Guided Scrolling'));
	});

	it('exports the generated result as json', async () => {
		vi.useFakeTimers();

		const createObjectURL = vi.fn(() => 'blob:promptify-export');
		const revokeObjectURL = vi.fn();
		const anchorClick = vi.fn();
		const originalCreateElement = document.createElement.bind(document);

		vi.stubGlobal(
			'fetch',
			vi.fn(async () => createFetchResponse(RAW_TEXT))
		);
		vi.stubGlobal('URL', {
			createObjectURL,
			revokeObjectURL
		});
		vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
			const element = originalCreateElement(tagName);
			if (tagName === 'a') {
				element.click = anchorClick;
			}
			return element;
		});

		render(Page);
		await page.getByRole('button', { name: /swiss \/ editorial grid/i }).click();
		await page.getByRole('button', { name: /generate prompt/i }).click();
		await page.getByRole('button', { name: /export json/i }).click();

		expect(createObjectURL).toHaveBeenCalledOnce();
		expect(anchorClick).toHaveBeenCalledOnce();

		await vi.advanceTimersByTimeAsync(1000);

		expect(revokeObjectURL).toHaveBeenCalledWith('blob:promptify-export');
	});

	it('exports the markdown prompt as a .md file', async () => {
		vi.useFakeTimers();

		const createObjectURL = vi.fn((blob: Blob) => {
			return 'blob:promptify-markdown-export';
		});
		const revokeObjectURL = vi.fn();
		const anchorClick = vi.fn();
		const originalCreateElement = document.createElement.bind(document);

		vi.stubGlobal(
			'fetch',
			vi.fn(async () => createFetchResponse(RAW_TEXT))
		);
		vi.stubGlobal('URL', {
			createObjectURL,
			revokeObjectURL
		});
		vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
			const element = originalCreateElement(tagName);
			if (tagName === 'a') {
				element.click = anchorClick;
			}
			return element;
		});

		render(Page);
		await page.getByRole('button', { name: /swiss \/ editorial grid/i }).click();
		await page.getByRole('button', { name: /generate prompt/i }).click();
		await page.getByRole('button', { name: /export markdown/i }).click();

		expect(createObjectURL).toHaveBeenCalledOnce();
		expect(anchorClick).toHaveBeenCalledOnce();

		const [markdownBlob] = createObjectURL.mock.calls[0] as [Blob];
		await expect(markdownBlob.text()).resolves.toContain('# Role');
		await expect(markdownBlob.text()).resolves.toContain('# Color Palette');

		await vi.advanceTimersByTimeAsync(1000);

		expect(revokeObjectURL).toHaveBeenCalledWith('blob:promptify-markdown-export');
	});

	it('regenerates using the current style and accent', async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(createFetchResponse(RAW_TEXT))
			.mockResolvedValueOnce(createFetchResponse(SECOND_RAW_TEXT));
		vi.stubGlobal('fetch', fetchMock);

		render(Page);
		await page.getByRole('button', { name: /swiss \/ editorial grid/i }).click();
		await page.getByRole('button', { name: /guided scrolling/i }).click();
		await page.getByRole('button', { name: /generate prompt/i }).click();
		await page.getByRole('button', { name: /regenerate/i }).click();

		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(fetchMock).toHaveBeenLastCalledWith(
			'/api/generate',
			expect.objectContaining({
				body: JSON.stringify({
					style: 'Swiss / Editorial Grid',
					accent: 'Guided Scrolling'
				})
			})
		);
		await expect
			.element(page.getByText('Another opening paragraph.', { exact: true }))
			.toBeInTheDocument();
	});

	it('trims history to the last five generations', async () => {
		const fetchMock = vi.fn(async (_input: string, init?: RequestInit) => {
			const payload = JSON.parse(String(init?.body));
			return createFetchResponse(createRawText(payload.style));
		});
		vi.stubGlobal('fetch', fetchMock);

		render(Page);

		const styleNames = [
			/Swiss \/ Editorial Grid/i,
			/Minimal \/ Luxury Minimal/i,
			/Typography First/i,
			/Nature Distilled/i,
			/Tactile Maximalism/i,
			/Retrofuturism/i
		];

		for (const styleName of styleNames) {
			await page.getByRole('button', { name: styleName }).click();
			await page.getByRole('button', { name: /generate prompt/i }).click();
		}

		await expect.element(page.getByText(`Last ${MAX_HISTORY}`)).toBeInTheDocument();
		await expect
			.element(page.getByRole('button', { name: /retrofuturism.*open saved result/i }))
			.toBeInTheDocument();
		await expect
			.element(page.getByRole('button', { name: /minimal \/ luxury minimal.*open saved result/i }))
			.toBeInTheDocument();
		await expect
			.element(page.getByRole('button', { name: /swiss \/ editorial grid.*open saved result/i }))
			.not.toBeInTheDocument();
	});
});
