<script lang="ts">
	import type { ParsedGeneration } from '$lib/landing-generator/types';

	type HistoryEntry = {
		style: string;
		accent: string | null;
		output: ParsedGeneration;
	};

	type Props = {
		items: HistoryEntry[];
		onSelect?: (item: HistoryEntry) => void;
	};

	let { items, onSelect }: Props = $props();
</script>

<section class="flex flex-col gap-4">
	<div class="flex items-baseline justify-between">
		<h2 class="text-sm font-semibold tracking-tight text-zinc-900">Recent generations</h2>
		<span class="text-xs text-zinc-400">Last {items.length}</span>
	</div>

	<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
		{#each items as item, index (`${item.style}-${item.accent ?? 'none'}-${index}`)}
			<button
				type="button"
				class="flex flex-col items-start gap-1 rounded-lg border border-zinc-200 bg-white p-4 text-left transition-all hover:border-black active:scale-[0.98]"
				onclick={() => onSelect?.(item)}
			>
				<strong class="text-sm font-semibold text-zinc-900">{item.style}</strong>
				<p class="text-xs text-zinc-500">{item.accent ?? 'No accent overlay'}</p>
				<span class="mt-2 text-[10px] font-bold tracking-wider uppercase text-zinc-400">
					Open result
				</span>
			</button>
		{/each}
	</div>
</section>
