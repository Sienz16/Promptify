import { beforeEach, describe, expect, it, vi } from 'vitest';

const { envState } = vi.hoisted(() => ({
	envState: {
		SECRET_API_KEY: 'test-key',
		SECRET_API_URL: 'https://api.example.com/v1/chat/completions',
		AI_MODEL: 'gpt-5.4-test'
	}
}));

vi.mock('./env', () => ({
	getPrivateEnv: () => envState
}));

import { buildApiRequestBody, requestLandingPrompt } from './api';

describe('requestLandingPrompt', () => {
	beforeEach(() => {
		envState.SECRET_API_KEY = 'test-key';
		envState.SECRET_API_URL = 'https://api.example.com/v1/chat/completions';
		envState.AI_MODEL = 'gpt-5.4-test';
	});

	it('builds the request body with the env model', () => {
		const body = buildApiRequestBody('Swiss / Editorial Grid', 'Guided Scrolling');

		expect(body.model).toBe('gpt-5.4-test');
		expect(body.max_tokens).toBe(2000);
		expect(body.messages[1].content).toContain('Selected design style: Swiss / Editorial Grid');
		expect(body.messages[1].content).toContain('Interaction layer accent: Guided Scrolling');
	});

	it('uses the env url and secret key for the upstream request', async () => {
		envState.SECRET_API_URL = 'https://api.example.com';

		const fetchImpl = vi.fn(
			async () =>
				new Response(JSON.stringify({ choices: [{ message: { content: 'ok' } }] }), {
					status: 200,
					headers: { 'Content-Type': 'application/json' }
				})
		);

		await requestLandingPrompt(fetchImpl, 'Swiss / Editorial Grid');

		expect(fetchImpl).toHaveBeenCalledWith(
			'https://api.example.com/v1/chat/completions',
			expect.objectContaining({
				headers: expect.objectContaining({
					Authorization: 'Bearer test-key'
				})
			})
		);
	});

	it('throws when SECRET_API_KEY is missing', async () => {
		envState.SECRET_API_KEY = '';

		await expect(requestLandingPrompt(vi.fn(), 'Swiss / Editorial Grid')).rejects.toThrow(
			'SECRET_API_KEY is not configured'
		);
	});

	it('throws when the upstream payload does not include message content', async () => {
		await expect(
			requestLandingPrompt(
				vi.fn(
					async () =>
						new Response(JSON.stringify({ choices: [{ message: {} }] }), {
							status: 200,
							headers: { 'Content-Type': 'application/json' }
						})
				),
				'Swiss / Editorial Grid'
			)
		).rejects.toThrow('API response missing message content');
	});
});
