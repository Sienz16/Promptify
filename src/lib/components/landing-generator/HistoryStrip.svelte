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

<section class="history">
	<div class="heading-row">
		<h2>Recent generations</h2>
		<span>Last {items.length}</span>
	</div>

	<div class="history-list">
		{#each items as item, index (`${item.style}-${item.accent ?? 'none'}-${index}`)}
			<button type="button" class="history-card" onclick={() => onSelect?.(item)}>
				<strong>{item.style}</strong>
				<p>{item.accent ?? 'No accent overlay'}</p>
				<span>Open saved result</span>
			</button>
		{/each}
	</div>
</section>

<style>
	.history {
		display: grid;
		gap: 1rem;
	}

	.heading-row {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		align-items: baseline;
	}

	h2,
	p {
		margin: 0;
	}

	.heading-row span,
	.history-card p,
	.history-card span {
		color: rgb(71 85 105);
	}

	.history-list {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 0.85rem;
	}

	.history-card {
		display: grid;
		gap: 0.35rem;
		padding: 0.95rem;
		border: 1px solid rgb(226 232 240);
		border-radius: 1rem;
		background: rgb(255 255 255 / 0.9);
		text-align: left;
		color: rgb(15 23 42);
		transition:
			transform 180ms ease,
			border-color 180ms ease,
			box-shadow 180ms ease;
	}

	.history-card:hover {
		transform: translateY(-1px);
		border-color: rgb(14 116 144 / 0.45);
		box-shadow: 0 12px 28px rgb(15 23 42 / 0.08);
	}
</style>
