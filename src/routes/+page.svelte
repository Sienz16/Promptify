<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import AccentPill from '$lib/components/landing-generator/AccentPill.svelte';
	import HistoryStrip from '$lib/components/landing-generator/HistoryStrip.svelte';
	import LoadingSkeleton from '$lib/components/landing-generator/LoadingSkeleton.svelte';
	import PaletteSwatches from '$lib/components/landing-generator/PaletteSwatches.svelte';
	import StyleCard from '$lib/components/landing-generator/StyleCard.svelte';
	import { ACCENT_OPTIONS, MAX_HISTORY, STYLE_OPTIONS } from '$lib/landing-generator/config';
	import { buildMarkdownPrompt } from '$lib/landing-generator/markdown-prompt';
	import { parseResponse } from '$lib/landing-generator/parser';
	import { pickRandomStyle } from '$lib/landing-generator/random';
	import type { AccentOption, ParsedGeneration, StyleOption } from '$lib/landing-generator/types';

	type HistoryEntry = { style: string; accent: string | null; output: ParsedGeneration };

	let selectedStyle = $state<StyleOption | null>(null);
	let selectedAccent = $state<AccentOption | null>(null);
	let isGenerating = $state(false);
	let isShuffling = $state(false);
	let errorMessage = $state('');
	let result = $state<ParsedGeneration | null>(null);
	let history = $state<HistoryEntry[]>([]);
	let lastRandomStyle = $state<string | null>(null);
	let shuffleLabel = $state('Surprise Me');

	const canGenerate = $derived(Boolean(selectedStyle) && !isGenerating);
	const canRegenerate = $derived(Boolean(selectedStyle) && Boolean(result) && !isGenerating);
	const promptParagraphs = $derived(
		result?.prompt
			.split(/\n\n+/)
			.map((paragraph) => paragraph.trim())
			.filter(Boolean) ?? []
	);
	const markdownPrompt = $derived(
		result && selectedStyle
			? buildMarkdownPrompt({
					style: selectedStyle,
					accent: selectedAccent?.name ?? null,
					result
				})
			: ''
	);

	async function readApiPayload(response: Response) {
		try {
			return await response.json();
		} catch {
			if (!response.ok) {
				return null;
			}

			throw new Error('Unable to generate prompt');
		}
	}

	function selectStyle(option: StyleOption) {
		selectedStyle = option;
		errorMessage = '';
	}

	function toggleAccent(option: AccentOption) {
		selectedAccent = selectedAccent?.id === option.id ? null : option;
	}

	async function surpriseMe() {
		if (isShuffling || isGenerating) {
			return;
		}

		isShuffling = true;
		errorMessage = '';

		const labels = STYLE_OPTIONS.map((option) => option.name);
		let pointer = 0;
		const interval = window.setInterval(() => {
			shuffleLabel = labels[pointer % labels.length];
			pointer += 1;
		}, 100);

		await new Promise((resolve) => window.setTimeout(resolve, 600));
		window.clearInterval(interval);

		const currentStyle = selectedStyle
			? (STYLE_OPTIONS.find((option) => option.id === selectedStyle?.id) ?? null)
			: null;
		const nextStyle = pickRandomStyle(STYLE_OPTIONS, currentStyle);

		selectedStyle = nextStyle;
		lastRandomStyle = nextStyle.name;
		shuffleLabel = 'Surprise Me';
		isShuffling = false;
	}

	async function generatePrompt() {
		if (!selectedStyle || isGenerating) {
			return;
		}

		isGenerating = true;
		errorMessage = '';

		try {
			const response = await fetch('/api/generate', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					style: selectedStyle.name,
					accent: selectedAccent?.name ?? null
				})
			});

			const payload = await readApiPayload(response);

			if (!response.ok) {
				throw new Error(payload?.message ?? 'Unable to generate prompt');
			}

			const parsed = parseResponse(payload.rawText ?? '');
			result = parsed;
			history = [
				{
					style: selectedStyle.name,
					accent: selectedAccent?.name ?? null,
					output: parsed
				},
				...history
			].slice(0, MAX_HISTORY);
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Unable to generate prompt';
		} finally {
			isGenerating = false;
		}
	}

	async function regenerate() {
		await generatePrompt();
	}

	async function copyPrompt() {
		if (!result) {
			return;
		}

		try {
			await navigator.clipboard.writeText(result.prompt);
		} catch {
			errorMessage = 'Copy failed. Please copy the prompt manually.';
		}
	}

	async function copyMarkdownPrompt() {
		if (!markdownPrompt) {
			return;
		}

		try {
			await navigator.clipboard.writeText(markdownPrompt);
		} catch {
			errorMessage = 'Copy failed. Please copy the markdown prompt manually.';
		}
	}

	function slugifyStyleName(styleName: string) {
		return styleName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
	}

	function downloadFile(content: string, type: string, filename: string) {
		const blob = new Blob([content], { type });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = filename;
		document.body.append(link);
		link.click();
		link.remove();
		window.setTimeout(() => {
			URL.revokeObjectURL(url);
		}, 1000);
	}

	function exportJson() {
		if (!result || !selectedStyle) {
			return;
		}

		downloadFile(
			JSON.stringify(
				{
					style: selectedStyle.name,
					accent: selectedAccent?.name ?? null,
					prompt: result.prompt,
					palette: result.palette
				},
				null,
				2
			),
			'application/json',
			`${slugifyStyleName(selectedStyle.name)}.json`
		);
	}

	function exportMarkdown() {
		if (!markdownPrompt || !selectedStyle) {
			return;
		}

		downloadFile(
			markdownPrompt,
			'text/markdown;charset=utf-8',
			`${slugifyStyleName(selectedStyle.name)}-landing-page-prompt.md`
		);
	}

	function openHistoryItem(item: HistoryEntry) {
		selectedStyle = STYLE_OPTIONS.find((option) => option.name === item.style) ?? selectedStyle;
		selectedAccent = ACCENT_OPTIONS.find((option) => option.name === item.accent) ?? null;
		result = item.output;
		errorMessage = '';
	}
</script>

<svelte:head>
	<title>Landing Page Generator</title>
	<meta
		name="description"
		content="Generate emotionally rich landing page prompts and production-ready color palettes from curated design styles."
	/>
</svelte:head>

<div class="page-shell">
	<section class="hero-card glass-panel">
		<p class="eyebrow">Promptify studio</p>
		<h1>Landing Page Generator</h1>
		<p class="lede">
			Choose a visual direction, add an optional interaction accent, and generate an accessible,
			performance-aware landing page brief with a ready-to-use five-color palette.
		</p>
		<p class="trust-note">Accessibility and performance are built in, not bolted on later.</p>
	</section>

	<section class="panel glass-panel">
		<div class="section-header">
			<h2 class="section-title">Pick a base style</h2>
			<p>Start with a design language, then layer interaction only if it sharpens the story.</p>
		</div>

		<div class="style-grid">
			{#each STYLE_OPTIONS as option (option.id)}
				<StyleCard
					{option}
					selected={selectedStyle?.id === option.id}
					onclick={() => selectStyle(option)}
				/>
			{/each}
		</div>
	</section>

	<section class="panel glass-panel">
		<div class="section-header">
			<h2 class="section-title">Optional accent</h2>
			<p>Keep it empty for a pure style study, or add a single interaction layer.</p>
		</div>

		<div class="accent-row">
			{#each ACCENT_OPTIONS as option (option.id)}
				<AccentPill
					{option}
					selected={selectedAccent?.id === option.id}
					onclick={() => toggleAccent(option)}
				/>
			{/each}
		</div>
		{#if selectedAccent}
			<p class="accent-copy">Selected accent: {selectedAccent.name}</p>
		{/if}
	</section>

	{#if selectedStyle}
		<section class="panel glass-panel confirmation" transition:fade={{ duration: 180 }}>
			<p class="eyebrow">Selected style</p>
			<h2 class="section-title">{selectedStyle.name}</h2>
			<p>{selectedStyle.description}</p>
			{#if selectedAccent}
				<p class="accent-copy">Accent overlay: {selectedAccent.name}</p>
			{/if}
		</section>
	{/if}

	<section class="panel glass-panel controls" aria-busy={isGenerating ? 'true' : 'false'}>
		<button type="button" class="primary-action" disabled={!canGenerate} onclick={generatePrompt}>
			{result ? 'Generate Prompt' : 'Generate Prompt'}
		</button>
		<button
			type="button"
			class="secondary-action"
			onclick={surpriseMe}
			disabled={isGenerating || isShuffling}
		>
			{shuffleLabel}
		</button>
		<button type="button" class="secondary-action" disabled={!canRegenerate} onclick={regenerate}>
			Regenerate
		</button>
	</section>

	{#if isGenerating}
		<div transition:fade={{ duration: 180 }}>
			<p class="loading-status" role="status" aria-live="polite">
				Generating prompt. Loading generated prompt and palette.
			</p>
			<LoadingSkeleton />
		</div>
	{/if}

	{#if errorMessage}
		<section class="error-card glass-panel" role="alert">
			<strong>Generation failed</strong>
			<p>{errorMessage}</p>
		</section>
	{/if}

	{#if result}
		<section
			class="panel glass-panel output-card"
			aria-labelledby="output-heading"
			transition:fly={{ y: 18, duration: 250 }}
		>
			<div class="output-header">
				<div>
					<p class="eyebrow">Generated output</p>
					<h2 id="output-heading" class="section-title">Prompt preview and palette</h2>
				</div>
				<div class="action-row">
					<button type="button" class="secondary-action" onclick={copyPrompt}>Copy Prompt</button>
					<button type="button" class="secondary-action" onclick={exportJson}>Export JSON</button>
				</div>
			</div>

			<div class="prompt-copy">
				{#each promptParagraphs as paragraph, index (`${index}-${paragraph.slice(0, 24)}`)}
					<p>{paragraph}</p>
				{/each}
			</div>

			<PaletteSwatches palette={result.palette} />

			<div class="output-header markdown-header">
				<div>
					<p class="eyebrow">Build handoff</p>
					<h3 class="section-title">Production-ready markdown prompt</h3>
				</div>
				<div class="action-row">
					<button type="button" class="secondary-action" onclick={copyMarkdownPrompt}>
						Copy Markdown Prompt
					</button>
					<button type="button" class="secondary-action" onclick={exportMarkdown}>
						Export Markdown
					</button>
				</div>
			</div>

			<pre class="markdown-prompt">{markdownPrompt}</pre>
		</section>
	{/if}

	{#if history.length > 0}
		<section class="panel glass-panel">
			<HistoryStrip items={history} onSelect={openHistoryItem} />
		</section>
	{/if}
</div>
