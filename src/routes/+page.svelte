<script lang="ts">
	import { fly } from 'svelte/transition';
</script>

<svelte:head>
	<title>Promptify — Ship faster with AI-generated landing pages</title>
	<meta
		name="description"
		content="Generate emotionally rich landing page prompts and production-ready color palettes from curated design styles."
	/>
</svelte:head>

<div class="relative w-full overflow-hidden">
	<!-- Geist Interactive Grid Background -->
	<div
		class="absolute inset-0 z-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"
	></div>

	<!-- Hero Section -->
	<div
		class="relative z-10 mx-auto flex max-w-5xl flex-col items-center justify-center gap-8 px-6 pt-32 pb-24 text-center sm:pt-40 sm:pb-32"
	>
		<div
			class="group inline-flex cursor-pointer items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 transition-all hover:border-zinc-300 hover:bg-zinc-50"
			transition:fly={{ y: -10, duration: 600, opacity: 0 }}
		>
			<span class="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
			<span class="text-[11px] font-medium uppercase tracking-widest text-zinc-600">
				Promptify Engine v1.0
			</span>
			<span class="text-zinc-400 transition-transform group-hover:translate-x-0.5">→</span>
		</div>

		<h1
			class="max-w-4xl text-5xl font-extrabold tracking-tighter text-black sm:text-7xl"
			transition:fly={{ y: 20, duration: 600, delay: 100, opacity: 0 }}
		>
			Design systems engineered for the AI era.
		</h1>

		<p
			class="max-w-2xl text-lg leading-relaxed text-zinc-500 sm:text-xl"
			transition:fly={{ y: 20, duration: 600, delay: 200, opacity: 0 }}
		>
			Stop wrestling with blank canvases. Choose a curated design language and instantly generate
			production-ready prompts, color palettes, and developer handoff markdown.
		</p>

		<div
			class="flex flex-wrap items-center justify-center gap-4 pt-4"
			transition:fly={{ y: 20, duration: 600, delay: 300, opacity: 0 }}
		>
			<a
				href="/generate"
				class="flex h-12 items-center justify-center rounded-lg bg-black px-8 text-sm font-semibold text-white shadow-[0_0_40px_rgba(0,0,0,0.1)] transition-all hover:bg-zinc-800 hover:shadow-[0_0_60px_rgba(0,0,0,0.15)] active:scale-[0.98]"
			>
				Start Generating
			</a>
			<a
				href="https://github.com"
				target="_blank"
				class="flex h-12 items-center justify-center rounded-lg border border-zinc-200 bg-white px-8 text-sm font-semibold text-black transition-all hover:border-black hover:bg-zinc-50 active:scale-[0.98]"
			>
				View Documentation
			</a>
		</div>
	</div>
</div>

<!-- Value Proposition Section -->
<section class="relative z-10 border-t border-zinc-100 bg-zinc-50/50 py-24">
	<div class="mx-auto max-w-5xl px-6">
		<div class="mb-16 text-center">
			<h2 class="text-3xl font-bold tracking-tight text-black sm:text-4xl">
				Everything you need to ship.
			</h2>
			<p class="mt-4 text-zinc-500">
				Built for developers and designers who value speed and precision.
			</p>
		</div>

		<div class="grid gap-6 sm:grid-cols-3">
			<div
				class="group flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-black hover:shadow-lg"
			>
				<div
					class="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 transition-colors group-hover:bg-black group-hover:text-white"
				>
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
						/></svg
					>
				</div>
				<h3 class="text-lg font-semibold text-black">Curated Styles</h3>
				<p class="text-sm leading-relaxed text-zinc-500">
					Select from deeply researched design languages that align with your brand's emotional
					core.
				</p>
			</div>

			<div
				class="group flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-black hover:shadow-lg"
			>
				<div
					class="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 transition-colors group-hover:bg-black group-hover:text-white"
				>
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M13 10V3L4 14h7v7l9-11h-7z"
						/></svg
					>
				</div>
				<h3 class="text-lg font-semibold text-black">Interaction Layers</h3>
				<p class="text-sm leading-relaxed text-zinc-500">
					Add precise interaction accents—like brutalist borders or soft glows—to make your UI feel
					alive.
				</p>
			</div>

			<div
				class="group flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-black hover:shadow-lg"
			>
				<div
					class="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 transition-colors group-hover:bg-black group-hover:text-white"
				>
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
						/></svg
					>
				</div>
				<h3 class="text-lg font-semibold text-black">Developer Handoff</h3>
				<p class="text-sm leading-relaxed text-zinc-500">
					Export production-ready Markdown prompts and JSON palettes directly to your LLM of choice.
				</p>
			</div>
		</div>
	</div>
</section>

<!-- Simple Footer -->
<footer class="border-t border-zinc-200 bg-white py-12">
	<div class="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 px-6 sm:flex-row">
		<div class="flex items-center gap-2">
			<div class="flex h-5 w-5 items-center justify-center rounded bg-black">
				<span class="text-[10px] font-bold text-white">P</span>
			</div>
			<p class="text-xs font-medium text-zinc-500">© 2026 Promptify Studio. All rights reserved.</p>
		</div>
		<div class="flex items-center gap-6">
			<a href="/" class="text-xs font-medium text-zinc-500 transition-colors hover:text-black">Terms</a>
			<a href="/" class="text-xs font-medium text-zinc-500 transition-colors hover:text-black">Privacy</a>
			<a href="/" class="text-xs font-medium text-zinc-500 transition-colors hover:text-black">GitHub</a>
		</div>
	</div>
</footer>
