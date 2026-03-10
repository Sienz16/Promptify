export type StyleOption = {
	id: number;
	name: string;
	description: string;
	category: 'core' | 'niche';
};

export type AccentOption = {
	id: string;
	name: string;
	description: string;
};

export type PaletteColor = {
	hex: string;
	role: 'Primary' | 'Secondary' | 'Accent' | 'Background' | 'Surface / Text';
	name: string;
};

export type Palette = {
	palette_name: string;
	mood: string;
	colors: PaletteColor[];
};

export type ParsedGeneration = {
	prompt: string;
	palette: Palette;
};
