import { AI_MODEL, SECRET_API_KEY, SECRET_API_URL } from '$env/static/private';
import { SYSTEM_PROMPT, buildGenerationInput } from '$lib/landing-generator/prompt';

const CHAT_COMPLETIONS_PATH = '/v1/chat/completions';

function getChatCompletionsUrl(baseUrl: string) {
	return new URL(CHAT_COMPLETIONS_PATH, `${baseUrl.replace(/\/+$/, '')}/`).toString();
}

export function buildApiRequestBody(styleName: string, accentName?: string | null) {
	return {
		model: AI_MODEL,
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
	if (!SECRET_API_KEY?.trim()) {
		throw new Error('SECRET_API_KEY is not configured');
	}

	if (!SECRET_API_URL?.trim()) {
		throw new Error('SECRET_API_URL is not configured');
	}

	if (!AI_MODEL?.trim()) {
		throw new Error('AI_MODEL is not configured');
	}

	const response = await fetchImpl(getChatCompletionsUrl(SECRET_API_URL), {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${SECRET_API_KEY}`
		},
		body: JSON.stringify(buildApiRequestBody(styleName, accentName))
	});

	if (!response.ok) {
		throw new Error(`API request failed: ${response.status}`);
	}

	const data = (await response.json()) as {
		choices?: Array<{ message?: { content?: string } }>;
	};
	const content = data.choices?.[0]?.message?.content;

	if (typeof content !== 'string' || content.trim().length === 0) {
		throw new Error('API response missing message content');
	}

	return content;
}
