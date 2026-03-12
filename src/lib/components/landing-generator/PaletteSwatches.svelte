<script lang="ts">
	import type { Palette } from '$lib/landing-generator/types';

	type Props = {
		palette: Palette;
	};

	let { palette }: Props = $props();
	const swatchCount = $derived(Math.max(palette.colors.length, 1));
</script>

<section class="flex min-w-0 flex-col gap-6">
	<div class="space-y-1">
		<h3 class="text-xl font-semibold tracking-tight text-black">Palette System</h3>
		<p class="text-sm leading-6 text-zinc-500">
			{palette.palette_name} builds around {palette.mood.toLowerCase()} with larger swatches and a clearer
			role legend.
		</p>
	</div>

	<div class="overflow-hidden rounded-[1.75rem] border border-zinc-200 bg-zinc-50">
		<div class="grid min-w-0 gap-px bg-zinc-200 md:grid-cols-[minmax(12rem,0.9fr)_minmax(0,1.6fr)]">
			<div class="flex flex-col justify-between gap-4 bg-white p-5 sm:p-6">
				<div class="space-y-3">
					<p class="text-[10px] font-bold tracking-[0.24em] text-zinc-400 uppercase">
						Palette Profile
					</p>
					<div class="space-y-1">
						<h4 class="text-lg font-semibold tracking-tight text-black">{palette.palette_name}</h4>
						<p class="text-sm leading-6 text-zinc-500">{palette.mood}</p>
					</div>
				</div>
				<div class="grid grid-cols-2 gap-3 text-xs text-zinc-500">
					<div>
						<p class="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">Swatches</p>
						<p class="mt-1 text-sm font-semibold text-black">{palette.colors.length}</p>
					</div>
					<div>
						<p class="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">Intent</p>
						<p class="mt-1 text-sm font-semibold text-black">UI-ready</p>
					</div>
				</div>
			</div>

			<div
				class="grid min-w-0 gap-px bg-zinc-200"
				style:grid-template-columns={`repeat(${swatchCount}, minmax(0, 1fr))`}
			>
				{#each palette.colors as color (color.role)}
					<article class="group min-w-0 bg-white">
						<div class="flex h-full min-w-0 flex-col">
							<div
								class="min-h-28 flex-1 border-b border-black/5 sm:min-h-36"
								style:background-color={color.hex}
							></div>
							<div class="min-w-0 space-y-2 p-4">
								<p class="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
									{color.role}
								</p>
								<div class="min-w-0">
									<p class="truncate text-sm font-semibold tracking-tight text-black">
										{color.name}
									</p>
									<code
										class="mt-1 block truncate font-mono text-[11px] text-zinc-500 transition-colors group-hover:text-black"
										>{color.hex}</code
									>
								</div>
							</div>
						</div>
					</article>
				{/each}
			</div>
		</div>
	</div>

	<div class="grid gap-3">
		{#each palette.colors as color (color.role)}
			<div
				class="flex min-w-0 items-center gap-4 rounded-2xl border border-zinc-200 bg-white px-4 py-3"
			>
				<div
					class="h-12 w-12 shrink-0 rounded-xl border border-black/5 shadow-inner"
					style:background-color={color.hex}
				></div>
				<div class="min-w-0 flex-1">
					<div
						class="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
					>
						<div class="min-w-0">
							<p class="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
								{color.role}
							</p>
							<p class="truncate text-sm font-semibold text-black">{color.name}</p>
						</div>
						<code class="font-mono text-[11px] text-zinc-500">{color.hex}</code>
					</div>
				</div>
			</div>
		{/each}
	</div>
</section>
