import { FALLBACK_PALETTE } from './config';
import type { Palette, ParsedGeneration } from './types';

const HEX_REGEX = /^#[0-9A-F]{6}$/i;
const REQUIRED_ROLES = ['Primary', 'Secondary', 'Accent', 'Background', 'Surface / Text'] as const;

function extractPaletteJson(rawText: string): string | null {
	const paletteKeyIndex = rawText.lastIndexOf('"palette_name"');

	if (paletteKeyIndex === -1) {
		return null;
	}

	const startIndex = rawText.lastIndexOf('{', paletteKeyIndex);

	if (startIndex === -1) {
		return null;
	}

	let depth = 0;
	let inString = false;
	let isEscaped = false;

	for (let index = startIndex; index < rawText.length; index += 1) {
		const char = rawText[index];

		if (isEscaped) {
			isEscaped = false;
			continue;
		}

		if (char === '\\') {
			isEscaped = true;
			continue;
		}

		if (char === '"') {
			inString = !inString;
			continue;
		}

		if (inString) {
			continue;
		}

		if (char === '{') {
			depth += 1;
		}

		if (char === '}') {
			depth -= 1;

			if (depth === 0) {
				return rawText.slice(startIndex, index + 1);
			}
		}
	}

	return null;
}

function isPalette(value: unknown): value is Palette {
	if (!value || typeof value !== 'object') {
		return false;
	}

	const candidate = value as Palette;

	if (
		typeof candidate.palette_name !== 'string' ||
		typeof candidate.mood !== 'string' ||
		!Array.isArray(candidate.colors) ||
		candidate.colors.length !== REQUIRED_ROLES.length
	) {
		return false;
	}

	return REQUIRED_ROLES.every((role) =>
		candidate.colors.some(
			(color) =>
				color.role === role &&
				typeof color.name === 'string' &&
				color.name.length > 0 &&
				typeof color.hex === 'string' &&
				HEX_REGEX.test(color.hex)
		)
	);
}

export function parseResponse(rawText: string): ParsedGeneration {
	const paletteJson = extractPaletteJson(rawText);
	const prompt = rawText.replace(paletteJson ?? '', '').trim();

	if (!paletteJson) {
		return { prompt, palette: FALLBACK_PALETTE };
	}

	try {
		const parsed = JSON.parse(paletteJson);

		return {
			prompt,
			palette: isPalette(parsed) ? parsed : FALLBACK_PALETTE
		};
	} catch {
		return { prompt, palette: FALLBACK_PALETTE };
	}
}
