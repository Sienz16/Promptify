export function getCryptoIndex(length: number): number {
	if (length <= 0) {
		throw new Error('getCryptoIndex requires a positive length');
	}

	const buffer = new Uint32Array(1);
	crypto.getRandomValues(buffer);
	return buffer[0] % length;
}

export function pickRandomStyle<T>(items: T[], lastItem: T | null, getIndex = getCryptoIndex): T {
	if (items.length === 0) {
		throw new Error('pickRandomStyle requires at least one item');
	}

	if (items.length === 1) {
		return items[0];
	}

	const pool = items.filter((item) => item !== lastItem);
	const candidates = pool.length > 0 ? pool : items;

	return candidates[getIndex(candidates.length)];
}
