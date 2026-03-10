<script lang="ts">
	import type { Palette } from '$lib/landing-generator/types';

	type Props = {
		palette: Palette;
	};

	let { palette }: Props = $props();
</script>

<section class="palette">
	<div class="palette-copy">
		<h3>{palette.palette_name}</h3>
		<p>{palette.mood}</p>
	</div>

	<div class="swatches">
		{#each palette.colors as color (color.role)}
			<article class="swatch-card">
				<div class="swatch" style:background-color={color.hex}></div>
				<div>
					<strong>{color.role}</strong>
					<p>{color.name}</p>
					<code>{color.hex}</code>
				</div>
			</article>
		{/each}
	</div>
</section>

<style>
	.palette {
		display: grid;
		gap: 1rem;
	}

	.palette-copy h3 {
		margin: 0;
		font-size: 1.1rem;
	}

	.palette-copy p {
		margin: 0.35rem 0 0;
		color: rgb(71 85 105);
		line-height: 1.5;
	}

	.swatches {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 0.85rem;
	}

	.swatch-card {
		display: grid;
		gap: 0.75rem;
		padding: 0.85rem;
		border: 1px solid rgb(226 232 240);
		border-radius: 1rem;
		background: rgb(248 250 252 / 0.78);
	}

	.swatch {
		height: 5rem;
		border-radius: 0.9rem;
		border: 1px solid rgb(255 255 255 / 0.65);
	}

	strong,
	code {
		display: block;
	}

	p,
	code {
		margin: 0.2rem 0 0;
	}

	p {
		color: rgb(71 85 105);
	}

	code {
		font-size: 0.82rem;
		color: rgb(15 23 42);
	}
</style>
