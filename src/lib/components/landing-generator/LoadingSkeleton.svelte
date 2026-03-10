<div class="skeleton" aria-hidden="true">
	<div class="prompt-block">
		<div class="shimmer line line-lg"></div>
		<div class="shimmer line"></div>
		<div class="shimmer line line-sm"></div>
	</div>

	<div class="palette-grid">
		{#each Array.from({ length: 5 }) as _, index (index)}
			<div class="swatch-card">
				<div class="shimmer swatch"></div>
				<div class="shimmer label"></div>
			</div>
		{/each}
	</div>
</div>

<style>
	.skeleton {
		display: grid;
		gap: 1.5rem;
		padding: 1.5rem;
		border: 1px solid rgb(226 232 240);
		border-radius: 1.5rem;
		background: rgb(255 255 255 / 0.82);
	}

	.prompt-block,
	.palette-grid {
		display: grid;
		gap: 0.85rem;
	}

	.palette-grid {
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
	}

	.swatch-card {
		display: grid;
		gap: 0.65rem;
	}

	.shimmer {
		background: linear-gradient(90deg, rgb(226 232 240), rgb(241 245 249), rgb(226 232 240));
		background-size: 200% 100%;
		animation: shimmer 1.2s linear infinite;
		border-radius: 999px;
	}

	.line {
		height: 0.9rem;
	}

	.line-lg {
		width: 100%;
	}

	.line-sm {
		width: 72%;
	}

	.swatch {
		height: 5rem;
		border-radius: 1rem;
	}

	.label {
		height: 0.8rem;
		width: 70%;
	}

	@keyframes shimmer {
		0% {
			background-position: 200% 0;
		}

		100% {
			background-position: -200% 0;
		}
	}
</style>
