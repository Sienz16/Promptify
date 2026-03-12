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
	type Stage = 'style' | 'accent' | 'loading' | 'result';

	let currentStage = $state<Stage>('style');
	let selectedStyle = $state<StyleOption | null>(null);
	let selectedAccent = $state<AccentOption | null>(null);
	let isGenerating = $state(false);
	let isShuffling = $state(false);
	let errorMessage = $state('');
	let result = $state<ParsedGeneration | null>(null);
	let history = $state<HistoryEntry[]>([]);
	let shuffleLabel = $state('Surprise Me');

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
	const paletteCount = $derived(result?.palette.colors.length ?? 0);
	const selectionLabel = $derived(
		selectedAccent
			? `${selectedStyle?.name ?? 'Unselected'} + ${selectedAccent.name}`
			: (selectedStyle?.name ?? 'Unselected')
	);

	const loadingMessages = [
		'Channeling the creative spirits...',
		'Almost there, brother. Great things take time.',
		'Sharpening the design language...',
		'Synthesizing your vision into code...',
		'Architecting a masterpiece just for you.',
		"Hold tight, we're building something legendary.",
		'The AI is carefully picking the perfect palette...'
	];
	let currentLoadingMessage = $state(loadingMessages[0]);
	let loadingInterval: number;

	function selectStyle(option: StyleOption) {
		selectedStyle = option;
		errorMessage = '';
	}

	function goToAccent() {
		if (selectedStyle) {
			currentStage = 'accent';
		}
	}

	function toggleAccent(option: AccentOption) {
		selectedAccent = selectedAccent?.id === option.id ? null : option;
	}

	async function surpriseMe() {
		if (isShuffling || isGenerating) return;
		isShuffling = true;

		const labels = STYLE_OPTIONS.map((option) => option.name);
		let pointer = 0;
		const interval = window.setInterval(() => {
			shuffleLabel = labels[pointer % labels.length];
			pointer += 1;
		}, 800 / labels.length);

		await new Promise((resolve) => window.setTimeout(resolve, 800));
		window.clearInterval(interval);

		selectedStyle = pickRandomStyle(STYLE_OPTIONS, selectedStyle);

		if (Math.random() > 0.5) {
			selectedAccent = ACCENT_OPTIONS[Math.floor(Math.random() * ACCENT_OPTIONS.length)];
		} else {
			selectedAccent = null;
		}

		shuffleLabel = 'Surprise Me';
		isShuffling = false;
		generatePrompt();
	}

	async function generatePrompt() {
		if (!selectedStyle) return;

		currentStage = 'loading';
		isGenerating = true;
		errorMessage = '';

		let msgIndex = 0;
		loadingInterval = window.setInterval(() => {
			msgIndex = (msgIndex + 1) % loadingMessages.length;
			currentLoadingMessage = loadingMessages[msgIndex];
		}, 2500);

		try {
			const response = await fetch('/api/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					style: selectedStyle.name,
					accent: selectedAccent?.name ?? null
				})
			});

			const payload = await response.json();
			if (!response.ok) throw new Error(payload?.message ?? 'Unable to generate prompt');

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

			currentStage = 'result';
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Unable to generate prompt';
			currentStage = 'style';
		} finally {
			isGenerating = false;
			window.clearInterval(loadingInterval);
		}
	}

	function startOver() {
		currentStage = 'style';
		selectedStyle = null;
		selectedAccent = null;
		result = null;
		errorMessage = '';
	}

	async function copyPrompt() {
		if (result) await navigator.clipboard.writeText(result.prompt);
	}

	async function copyMarkdown() {
		if (markdownPrompt) await navigator.clipboard.writeText(markdownPrompt);
	}

	function exportJson() {
		if (!result || !selectedStyle) return;
		const blob = new Blob(
			[
				JSON.stringify(
					{
						style: selectedStyle.name,
						accent: selectedAccent?.name ?? null,
						prompt: result.prompt,
						palette: result.palette
					},
					null,
					2
				)
			],
			{ type: 'application/json' }
		);
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `${selectedStyle.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`;
		link.click();
	}

	function exportMarkdown() {
		if (!markdownPrompt || !selectedStyle) return;
		const blob = new Blob([markdownPrompt], { type: 'text/markdown;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `${selectedStyle.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-brief.md`;
		link.click();
	}

	function openHistoryItem(item: HistoryEntry) {
		selectedStyle = STYLE_OPTIONS.find((option) => option.name === item.style) ?? null;
		selectedAccent = ACCENT_OPTIONS.find((option) => option.name === item.accent) ?? null;
		result = item.output;
		currentStage = 'result';
		errorMessage = '';
	}
</script>

<svelte:head>
	<title>Generator Console — Promptify</title>
</svelte:head>

<div class="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-12 sm:py-20">
	<header class="flex items-center justify-between">
		<div class="flex items-center gap-4">
			<a
				href="/"
				class="group flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 transition-all hover:border-black active:scale-90"
			>
				<span class="text-lg transition-transform group-hover:-translate-x-0.5">←</span>
			</a>
			<div>
				<h1 class="text-xl font-bold tracking-tight text-black">Generator Console</h1>
				<p class="text-xs text-zinc-500">
					Stage {currentStage === 'style' ? '1' : currentStage === 'accent' ? '2' : '3'} of 3
				</p>
			</div>
		</div>

		{#if currentStage !== 'style' && !isGenerating}
			<button
				onclick={startOver}
				class="text-xs font-medium text-zinc-400 transition-colors hover:text-black"
			>
				Reset Forge
			</button>
		{/if}
	</header>

	<main class="relative min-h-[500px]">
		<!-- STAGE 1: STYLE SELECTION -->
		{#if currentStage === 'style'}
			<div
				class="flex flex-col gap-8 pb-32"
				in:fly={{ x: 20, duration: 400 }}
				out:fly={{ x: -20, duration: 400 }}
			>
				<div class="space-y-2 border-b border-zinc-100 pb-4">
					<h2 class="text-2xl font-bold tracking-tight text-black uppercase">
						1. Pick a base style
					</h2>
					<p class="text-sm text-zinc-500">
						Choose the fundamental design logic for your landing page.
					</p>
				</div>

				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each STYLE_OPTIONS as option (option.id)}
						<StyleCard
							{option}
							selected={selectedStyle?.id === option.id}
							onclick={() => selectStyle(option)}
						/>
					{/each}
				</div>

				<div class="fixed inset-x-0 bottom-8 z-30 flex justify-center px-6">
					<div
						class="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white/90 p-2 shadow-2xl backdrop-blur-md sm:gap-3"
					>
						<button
							onclick={surpriseMe}
							disabled={isShuffling}
							class="flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 text-sm font-semibold text-black transition-all hover:border-black active:scale-95 disabled:opacity-50"
						>
							<svg
								class="mr-2 h-4 w-4 {isShuffling ? 'animate-spin' : ''}"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="2"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
								/></svg
							>
							{shuffleLabel}
						</button>

						<button
							onclick={goToAccent}
							disabled={!selectedStyle}
							class="flex h-11 items-center justify-center rounded-xl bg-black px-8 text-sm font-semibold text-white transition-all hover:bg-zinc-800 active:scale-95 disabled:bg-zinc-100 disabled:text-zinc-400"
						>
							Next Stage →
						</button>
					</div>
				</div>
			</div>
		{/if}

		<!-- STAGE 2: ACCENT SELECTION -->
		{#if currentStage === 'accent'}
			<div
				class="flex flex-col gap-8 pb-32"
				in:fly={{ x: 20, duration: 400 }}
				out:fly={{ x: -20, duration: 400 }}
			>
				<div class="space-y-2 border-b border-zinc-100 pb-4">
					<h2 class="text-2xl font-bold tracking-tight text-black uppercase">2. Optional accent</h2>
					<p class="text-sm text-zinc-500">Add an interaction layer to sharpen the visual story.</p>
				</div>

				<div class="flex flex-wrap gap-3 py-4">
					{#each ACCENT_OPTIONS as option (option.id)}
						<AccentPill
							{option}
							selected={selectedAccent?.id === option.id}
							onclick={() => toggleAccent(option)}
						/>
					{/each}
				</div>

				<div class="rounded-xl border border-zinc-200 bg-zinc-50 p-6">
					<p class="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
						Current Selection
					</p>
					<div class="mt-2 flex items-baseline gap-2">
						<span class="text-lg font-bold text-black">{selectedStyle?.name}</span>
						{#if selectedAccent}
							<span class="text-zinc-400">+</span>
							<span class="text-lg font-bold text-black">{selectedAccent.name}</span>
						{/if}
					</div>
				</div>

				<div class="fixed inset-x-0 bottom-8 z-30 flex justify-center px-6">
					<div
						class="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white/90 p-2 shadow-2xl backdrop-blur-md sm:gap-3"
					>
						<button
							onclick={() => (currentStage = 'style')}
							class="flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 text-sm font-semibold text-black transition-all hover:border-black active:scale-95"
						>
							← Back
						</button>

						<button
							onclick={generatePrompt}
							class="flex h-11 items-center justify-center rounded-xl bg-black px-8 text-sm font-semibold text-white transition-all hover:bg-zinc-800 active:scale-95"
						>
							{selectedAccent ? 'Generate with Accent' : 'Generate Plain Style'}
						</button>
					</div>
				</div>
			</div>
		{/if}

		<!-- STAGE 3: LOADING -->
		{#if currentStage === 'loading'}
			<div class="flex flex-col items-center gap-12 py-20 text-center" in:fade={{ duration: 400 }}>
				<div class="flex flex-col gap-3">
					<h2 class="text-xl font-bold text-black" role="status">
						{currentLoadingMessage}
					</h2>
					<p class="text-sm text-zinc-400">
						Our AI is putting in the work, just like you, brother.
					</p>
				</div>
				<div class="w-full max-w-4xl">
					<LoadingSkeleton />
				</div>
			</div>
		{/if}

		<!-- STAGE 4: RESULT -->
		{#if currentStage === 'result' && result}
			<div class="flex flex-col gap-12 pb-20" in:fly={{ y: 20, duration: 600 }}>
				<section id="result-output" class="flex w-full scroll-mt-24 flex-col gap-6">
					<section
						class="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8"
					>
						<div class="flex flex-col gap-8">
							<div
								class="flex flex-col gap-6 border-b border-zinc-100 pb-6 lg:flex-row lg:items-start lg:justify-between"
							>
								<div class="space-y-3">
									<div class="flex items-center gap-2">
										<span class="h-2 w-2 rounded-full bg-green-500"></span>
										<p class="text-[10px] font-bold tracking-[0.24em] text-zinc-400 uppercase">
											Synthesis Complete
										</p>
									</div>
									<div class="space-y-2">
										<h2 class="text-3xl font-bold tracking-tight text-black sm:text-4xl">
											Result Overview
										</h2>
										<p class="max-w-2xl text-sm leading-6 text-zinc-500">
											A clearer handoff for the selected direction, with the brief, palette, and
											export-ready developer notes separated into their own working areas.
										</p>
									</div>
								</div>

								<div class="flex flex-wrap gap-2 lg:max-w-xs lg:justify-end">
									<button
										onclick={copyPrompt}
										class="flex h-10 items-center rounded-full border border-zinc-200 bg-white px-4 text-xs font-semibold text-zinc-700 transition-colors hover:border-black hover:text-black active:bg-zinc-50"
										>Copy Brief</button
									>
									<button
										onclick={exportJson}
										class="flex h-10 items-center rounded-full border border-zinc-200 bg-white px-4 text-xs font-semibold text-zinc-700 transition-colors hover:border-black hover:text-black active:bg-zinc-50"
										>Export JSON</button
									>
								</div>
							</div>

							<div class="grid gap-3 sm:grid-cols-3">
								<div class="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4">
									<p class="text-[10px] font-bold tracking-[0.24em] text-zinc-400 uppercase">
										Direction
									</p>
									<p class="mt-2 text-base font-semibold tracking-tight text-black">
										{selectionLabel}
									</p>
								</div>
								<div class="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4">
									<p class="text-[10px] font-bold tracking-[0.24em] text-zinc-400 uppercase">
										Palette
									</p>
									<p class="mt-2 text-base font-semibold tracking-tight text-black">
										{result.palette.palette_name}
									</p>
								</div>
								<div class="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4">
									<p class="text-[10px] font-bold tracking-[0.24em] text-zinc-400 uppercase">
										Color Roles
									</p>
									<p class="mt-2 text-base font-semibold tracking-tight text-black">
										{paletteCount} swatches
									</p>
								</div>
							</div>

							<section class="space-y-4">
								<div class="space-y-1">
									<h3 class="text-xl font-semibold tracking-tight text-black">Generated Brief</h3>
									<p class="text-sm text-zinc-500">
										The generated language, broken into readable paragraphs instead of one
										continuous block.
									</p>
								</div>
								<div class="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-5 sm:p-6">
									<div
										class="prose max-w-none text-sm leading-7 break-words text-zinc-700 prose-zinc"
									>
										{#each promptParagraphs as paragraph, index (`${index}`)}
											<p>{paragraph}</p>
										{/each}
									</div>
								</div>
							</section>
						</div>
					</section>

					<section
						class="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8"
					>
						<div class="flex flex-col gap-6">
							<div class="space-y-1 border-b border-zinc-100 pb-5">
								<p class="text-[10px] font-bold tracking-[0.24em] text-zinc-400 uppercase">
									Palette System
								</p>
								<p class="text-sm text-zinc-500">
									The generated swatches stay intact, with the palette component presented as a
									full-width reference row.
								</p>
							</div>
							<PaletteSwatches palette={result.palette} />
						</div>
					</section>

					<section
						class="overflow-hidden rounded-[2rem] border border-zinc-200 bg-zinc-50/80 p-6 shadow-sm sm:p-8"
					>
						<div class="flex flex-col gap-4">
							<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
								<div class="space-y-1">
									<h3 class="text-xl font-semibold tracking-tight text-black">Developer Handoff</h3>
									<p class="text-sm text-zinc-500">
										A quieter export surface for the markdown payload and implementation copy.
									</p>
								</div>
								<div class="flex flex-wrap gap-2 sm:justify-end">
									<button
										onclick={copyMarkdown}
										class="flex h-10 items-center rounded-full border border-zinc-200 bg-white px-4 text-xs font-semibold text-zinc-700 transition-colors hover:border-black hover:text-black active:bg-zinc-50"
										>Copy Markdown</button
									>
									<button
										onclick={exportMarkdown}
										class="flex h-10 items-center rounded-full bg-black px-4 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 active:bg-black"
										>Download .md</button
									>
								</div>
							</div>
							<pre
								class="max-w-full overflow-x-auto rounded-2xl border border-zinc-200 bg-white p-4 font-mono text-[11px] leading-6 break-words whitespace-pre-wrap text-zinc-500 sm:p-5"><code
									>{markdownPrompt}</code
								></pre>
						</div>
					</section>
				</section>

				<div class="flex justify-center pb-12">
					<button
						onclick={startOver}
						class="flex h-12 items-center justify-center rounded-full bg-black px-12 text-sm font-semibold text-white shadow-xl transition-all hover:bg-zinc-800 active:scale-95"
					>
						Start New Forge
					</button>
				</div>
			</div>
		{/if}

		{#if errorMessage}
			<div class="rounded-lg border border-red-200 bg-red-50 p-6 text-red-900" role="alert">
				<p class="font-bold">Forge Interrupted</p>
				<p class="text-sm">{errorMessage}</p>
				<button
					onclick={startOver}
					class="mt-4 text-xs font-bold underline transition-colors hover:text-black"
					>Try Again</button
				>
			</div>
		{/if}
	</main>

	<!-- History Section -->
	{#if history.length > 0 && currentStage !== 'loading'}
		<section class="border-t border-zinc-100 pt-16">
			<HistoryStrip items={history} onSelect={openHistoryItem} />
		</section>
	{/if}
</div>
