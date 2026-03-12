import { SYSTEM_PROMPT, buildGenerationInput } from '$lib/landing-generator/prompt';
import { getPrivateEnv } from './env';

const CHAT_COMPLETIONS_PATH = '/v1/chat/completions';

function getChatCompletionsUrl(baseUrl: string) {
	return new URL(CHAT_COMPLETIONS_PATH, `${baseUrl.replace(/\/+$/, '')}/`).toString();
}

export function buildApiRequestBody(styleName: string, accentName?: string | null) {
	const { AI_MODEL } = getPrivateEnv();

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
	const {
		SECRET_API_KEY: secretApiKey,
		SECRET_API_URL: secretApiUrl,
		AI_MODEL: aiModel
	} = getPrivateEnv();

	if (!secretApiKey?.trim()) {
		throw new Error('SECRET_API_KEY is not configured');
	}

	if (!secretApiUrl?.trim()) {
		throw new Error('SECRET_API_URL is not configured');
	}

	if (!aiModel?.trim()) {
		throw new Error('AI_MODEL is not configured');
	}

	const response = await fetchImpl(getChatCompletionsUrl(secretApiUrl), {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${secretApiKey}`
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
