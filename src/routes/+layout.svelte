<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- Consistent Sticky Navigation -->
<nav
	class="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b border-zinc-200 bg-white/80 px-6 backdrop-blur-md transition-all"
>
	<a href="/" class="flex items-center gap-2 transition-opacity hover:opacity-80">
		<div class="flex h-6 w-6 items-center justify-center rounded bg-black">
			<span class="text-xs font-bold text-white">P</span>
		</div>
		<span class="font-semibold tracking-tight text-black">Promptify</span>
		<span class="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600">
			Beta
		</span>
	</a>
	<div class="flex items-center gap-4">
		<a
			href="https://github.com"
			target="_blank"
			class="text-sm font-medium text-zinc-500 transition-colors hover:text-black"
		>
			GitHub
		</a>
		<a
			href="/generate"
			class="rounded-md bg-black px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-zinc-800 active:scale-95"
		>
			Start Building
		</a>
	</div>
</nav>

<div class="pt-14">
	{@render children()}
</div>
