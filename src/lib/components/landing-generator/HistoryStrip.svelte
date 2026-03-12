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

<section class="flex flex-col gap-6">
	<div class="flex items-baseline justify-between border-b border-zinc-100 pb-4">
		<h2 class="text-[10px] font-bold tracking-[0.24em] uppercase text-zinc-400">Recent generations</h2>
		<span class="text-[10px] font-bold tracking-widest text-zinc-300 uppercase">Archive / {items.length}</span>
	</div>

	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each items as item, index (`${item.style}-${item.accent ?? 'none'}-${index}`)}
			<button
				type="button"
				class="group flex flex-col items-start gap-1 rounded-md border border-zinc-200 bg-white p-5 text-left transition-all hover:border-black active:scale-[0.99] hover:bg-zinc-50/50"
				onclick={() => onSelect?.(item)}
			>
				<div class="flex w-full items-center justify-between">
					<strong class="text-sm font-bold tracking-tight text-black">{item.style}</strong>
					<span class="text-[10px] font-bold tracking-widest text-zinc-300 group-hover:text-black transition-colors uppercase">
						Restore →
					</span>
				</div>
				<p class="text-xs text-zinc-500">{item.accent ?? 'No accent overlay'}</p>
			</button>
		{/each}
	</div>
</section>
