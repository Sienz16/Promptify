import { json, type RequestHandler } from '@sveltejs/kit';

import { requestLandingPrompt } from '$lib/server/api';

export const POST: RequestHandler = async ({ request, fetch }) => {
	let body: { style?: unknown; accent?: unknown };

	try {
		body = (await request.json()) as { style?: unknown; accent?: unknown };
	} catch {
		return json({ message: 'Invalid request body' }, { status: 400 });
	}

	const { style, accent } = body;

	if (typeof style !== 'string' || style.trim().length === 0) {
		return json({ message: 'Style is required' }, { status: 400 });
	}

	try {
		const rawText = await requestLandingPrompt(
			fetch,
			style,
			typeof accent === 'string' && accent.trim().length > 0 ? accent : undefined
		);

		return json({ rawText });
	} catch {
		return json({ message: 'Unable to generate prompt' }, { status: 502 });
	}
};
