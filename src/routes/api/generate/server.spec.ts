import { beforeEach, describe, expect, it, vi } from 'vitest';

const { requestLandingPrompt } = vi.hoisted(() => ({
	requestLandingPrompt: vi.fn()
}));

vi.mock('$lib/server/api', () => ({
	requestLandingPrompt
}));

import { POST } from './+server';

describe('POST /api/generate', () => {
	beforeEach(() => {
		requestLandingPrompt.mockReset();
	});

	it('returns 400 when style is missing', async () => {
		const response = await POST({
			request: new Request('http://localhost/api/generate', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ accent: 'Guided Scrolling' })
			}),
			fetch: vi.fn()
		} as unknown as Parameters<typeof POST>[0]);

		expect(response.status).toBe(400);
		expect(await response.json()).toEqual({ message: 'Style is required' });
	});

	it('returns 400 when the request body is malformed JSON', async () => {
		const response = await POST({
			request: new Request('http://localhost/api/generate', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: '{bad json}'
			}),
			fetch: vi.fn()
		} as unknown as Parameters<typeof POST>[0]);

		expect(response.status).toBe(400);
		expect(await response.json()).toEqual({ message: 'Invalid request body' });
	});

	it('returns rawText for a valid request', async () => {
		requestLandingPrompt.mockResolvedValue('Paragraph one.');

		const fetchImpl = vi.fn();
		const response = await POST({
			request: new Request('http://localhost/api/generate', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					style: 'Swiss / Editorial Grid',
					accent: 'Guided Scrolling'
				})
			}),
			fetch: fetchImpl
		} as unknown as Parameters<typeof POST>[0]);

		expect(requestLandingPrompt).toHaveBeenCalledWith(
			fetchImpl,
			'Swiss / Editorial Grid',
			'Guided Scrolling'
		);
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ rawText: 'Paragraph one.' });
	});

	it('maps upstream failures to 502', async () => {
		requestLandingPrompt.mockRejectedValue(new Error('API request failed: 500'));

		const response = await POST({
			request: new Request('http://localhost/api/generate', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ style: 'Swiss / Editorial Grid' })
			}),
			fetch: vi.fn()
		} as unknown as Parameters<typeof POST>[0]);

		expect(response.status).toBe(502);
		expect(await response.json()).toEqual({ message: 'Unable to generate prompt' });
	});
});
