<div class="grid gap-6 rounded-lg border border-zinc-200 bg-zinc-50 p-6" aria-hidden="true">
	<div class="grid gap-3">
		<div class="h-4 w-full animate-pulse rounded bg-zinc-200"></div>
		<div class="h-4 w-5/6 animate-pulse rounded bg-zinc-200"></div>
		<div class="h-4 w-2/3 animate-pulse rounded bg-zinc-200"></div>
	</div>

	<div class="grid grid-cols-2 gap-4 sm:grid-cols-5">
		{#each Array.from({ length: 5 }) as _, index (index)}
			<div class="flex flex-col gap-3">
				<div class="h-20 animate-pulse rounded-lg bg-zinc-200"></div>
				<div class="h-3 w-3/4 animate-pulse rounded bg-zinc-200"></div>
			</div>
		{/each}
	</div>
</div>
