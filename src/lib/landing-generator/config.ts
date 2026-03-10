import type { AccentOption, Palette, StyleOption } from './types';

export const STYLE_OPTIONS: StyleOption[] = [
	{
		id: 1,
		name: 'Swiss / Editorial Grid',
		description: 'Systematic grid, precise hierarchy, ultra-clean typography',
		category: 'core'
	},
	{
		id: 2,
		name: 'Minimal / Luxury Minimal',
		description: 'Premium restraint, maximum whitespace, essential only',
		category: 'core'
	},
	{
		id: 3,
		name: 'Typography First',
		description: 'Type as the hero, letterforms as the primary design system',
		category: 'core'
	},
	{
		id: 4,
		name: 'Nature Distilled',
		description: 'Warm minimalism, organic calm, Japandi-evolved, tactile natural materials',
		category: 'core'
	},
	{
		id: 5,
		name: 'Tactile Maximalism',
		description: 'Layered richness, bold color, textural depth, sensory abundance',
		category: 'core'
	},
	{
		id: 6,
		name: 'Retrofuturism',
		description: 'Dial-up nostalgia meets forward momentum, refined retro-tech aesthetic',
		category: 'core'
	},
	{
		id: 7,
		name: 'Elevated Brutalism / Anti-Design',
		description: 'Raw confrontational structure with intentional sophistication',
		category: 'core'
	},
	{
		id: 8,
		name: 'Hyperreal / Immersive 3D',
		description: 'Photorealistic depth, dimensional environments, spatial UI',
		category: 'core'
	},
	{
		id: 9,
		name: 'Handmade Collage',
		description: 'Craft-forward, analog texture, human imperfection as beauty',
		category: 'core'
	},
	{
		id: 10,
		name: 'Ambient Tech / AI-Forward',
		description: 'Soft intelligence, gradient warmth, fluid system-level thinking',
		category: 'core'
	},
	{
		id: 11,
		name: 'Adaptive Dark Mode',
		description: 'High contrast elegance, designed-for-dark sophistication',
		category: 'core'
	},
	{
		id: 12,
		name: 'Corporate Professional',
		description: 'Trust-building authority, refined establishment, confident clarity',
		category: 'core'
	},
	{
		id: 13,
		name: 'Heritage Editorial / Museumcore',
		description: 'Luxury cultural gravitas, archival sophistication',
		category: 'niche'
	},
	{
		id: 14,
		name: 'Neumorphic',
		description: 'Soft extruded surfaces, tactile product UI, refined fintech feel',
		category: 'niche'
	},
	{
		id: 15,
		name: 'Dopamine / Hypercolor',
		description: 'Saturated joy, Gen Z energy, unapologetic chromatic boldness',
		category: 'niche'
	}
];

export const ACCENT_OPTIONS: AccentOption[] = [
	{
		id: 'A',
		name: 'Dynamic Text Treatments',
		description: 'Type that moves, shifts, or reveals as part of the narrative'
	},
	{
		id: 'B',
		name: 'Guided Scrolling',
		description: 'Page choreographs the journey; motion reveals story progressively'
	},
	{
		id: 'C',
		name: 'Experimental Navigation',
		description: 'Spatial, non-linear, or unconventional wayfinding'
	},
	{
		id: 'D',
		name: 'Motion / Micro-interactions',
		description: 'Precise, purposeful animation that rewards attention'
	},
	{
		id: 'E',
		name: 'AI Assistant Patterns',
		description: 'Conversational UI elements woven into the visual language'
	},
	{
		id: 'F',
		name: 'Sustainable / Accessible Performance-First',
		description: 'Restraint and inclusion as aesthetic virtues'
	}
];

export const FALLBACK_PALETTE: Palette = {
	palette_name: 'Quiet Foundation',
	mood: 'Balanced neutrals with a steady accent for reliable fallback rendering.',
	colors: [
		{ hex: '#1F3A5F', role: 'Primary', name: 'Deep Harbor' },
		{ hex: '#6B7280', role: 'Secondary', name: 'Soft Steel' },
		{ hex: '#D97706', role: 'Accent', name: 'Amber Signal' },
		{ hex: '#F8F5EF', role: 'Background', name: 'Warm Paper' },
		{ hex: '#111827', role: 'Surface / Text', name: 'Graphite' }
	]
};

export const MAX_HISTORY = 5;
