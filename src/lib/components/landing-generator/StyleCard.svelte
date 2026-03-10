<script lang="ts">
	import type { StyleOption } from '$lib/landing-generator/types';

	type Props = {
		option: StyleOption;
		selected?: boolean;
		onclick?: () => void;
	};

	let { option, selected = false, onclick }: Props = $props();
</script>

<button type="button" class:selected class="style-card" aria-pressed={selected} {onclick}>
	<span class="meta">{option.category}</span>
	<strong>{option.name}</strong>
	<span>{option.description}</span>
</button>

<style>
	.style-card {
		display: grid;
		gap: 0.5rem;
		width: 100%;
		padding: 1rem;
		border: 1px solid rgb(203 213 225);
		border-radius: 1rem;
		background: rgb(255 255 255 / 0.9);
		text-align: left;
		color: rgb(15 23 42);
		transition:
			transform 180ms ease,
			border-color 180ms ease,
			background 180ms ease,
			box-shadow 180ms ease;
	}

	.style-card:hover {
		transform: translateY(-1px);
		border-color: rgb(13 148 136 / 0.45);
		box-shadow: 0 14px 32px rgb(15 23 42 / 0.08);
	}

	.style-card.selected {
		border-color: rgb(13 148 136);
		background: linear-gradient(180deg, rgb(240 253 250), rgb(255 255 255));
		box-shadow: 0 16px 36px rgb(13 148 136 / 0.16);
	}

	.meta {
		font-size: 0.72rem;
		font-weight: 700;
		line-height: 1;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: rgb(71 85 105);
	}

	strong {
		font-size: 1rem;
		font-weight: 700;
	}

	span:last-child {
		font-size: 0.94rem;
		line-height: 1.5;
		color: rgb(71 85 105);
	}
</style>
