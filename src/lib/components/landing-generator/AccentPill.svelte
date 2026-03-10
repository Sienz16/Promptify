<script lang="ts">
	import type { AccentOption } from '$lib/landing-generator/types';

	type Props = {
		option: AccentOption;
		selected?: boolean;
		onclick?: () => void;
	};

	let { option, selected = false, onclick }: Props = $props();
</script>

<button type="button" class:selected class="accent-pill" aria-pressed={selected} {onclick}>
	<span>{option.name}</span>
</button>

<style>
	.accent-pill {
		padding: 0.7rem 1rem;
		border: 1px solid rgb(191 219 254);
		border-radius: 999px;
		background: rgb(248 250 252);
		font-size: 0.92rem;
		font-weight: 600;
		color: rgb(30 41 59);
		transition:
			border-color 180ms ease,
			background 180ms ease,
			color 180ms ease,
			transform 180ms ease;
	}

	.accent-pill:hover {
		transform: translateY(-1px);
		border-color: rgb(56 189 248 / 0.55);
	}

	.accent-pill.selected {
		border-color: rgb(14 116 144);
		background: rgb(236 254 255);
		color: rgb(8 47 73);
	}
</style>
