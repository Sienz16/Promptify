<script lang="ts">
	import type { Palette } from '$lib/landing-generator/types';

	type Props = {
		palette: Palette;
	};

	let { palette }: Props = $props();
	const swatchCount = $derived(Math.max(palette.colors.length, 1));

	function useClipboardState() {
		let copied = $state(false);
		let timer: number;

		return {
			get value() { return copied; },
			set: (val: boolean) => {
				copied = val;
				window.clearTimeout(timer);
				if (val) {
					timer = window.setTimeout(() => (copied = false), 2000);
				}
			}
		};
	}
</script>

<section class="flex min-w-0 flex-col gap-8">
	<div class="overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50/50">
		<div class="grid min-w-0 gap-px bg-zinc-200 md:grid-cols-[minmax(14rem,1fr)_minmax(0,2fr)]">
			<!-- Palette Info Side -->
			<div class="flex flex-col justify-between gap-6 bg-white p-6 sm:p-8">
				<div class="space-y-4">
					<p class="text-[10px] font-bold tracking-[0.24em] text-zinc-400 uppercase">
						Palette Profile
					</p>
					<div class="space-y-2">
						<h4 class="text-xl font-bold tracking-tight text-black">{palette.palette_name}</h4>
						<p class="text-sm leading-relaxed text-zinc-500">{palette.mood}</p>
					</div>
				</div>
				<div class="grid grid-cols-2 gap-4 text-xs text-zinc-500">
					<div>
						<p class="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">Swatches</p>
						<p class="mt-1.5 text-sm font-bold text-black">{palette.colors.length}</p>
					</div>
					<div>
						<p class="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">Intent</p>
						<p class="mt-1.5 text-sm font-bold text-black">UI-ready</p>
					</div>
				</div>
			</div>

			<!-- Visual Swatches Grid -->
			<div
				class="grid min-w-0 gap-px bg-zinc-200"
				style:grid-template-columns={`repeat(${swatchCount}, minmax(0, 1fr))`}
			>
				{#each palette.colors as color (color.role)}
					<article class="group min-w-0 bg-white">
						<div class="flex h-full min-w-0 flex-col">
							<div
								class="h-40 border-b border-black/5 transition-opacity group-hover:opacity-90 sm:h-48"
								style:background-color={color.hex}
							></div>
							<div class="flex-1 min-w-0 space-y-2 p-4 sm:p-5">
								<p class="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
									{color.role}
								</p>
								<div class="min-w-0 space-y-1">
									<p class="truncate text-sm font-bold tracking-tight text-black">
										{color.name}
									</p>
									<code
										class="block truncate font-mono text-[11px] text-zinc-400 transition-colors group-hover:text-black"
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

	<!-- Token List -->
	<div class="grid gap-2">
		{#each palette.colors as color (color.role)}
			{@const clipboard = useClipboardState()}
			<div
				class="flex min-w-0 items-center gap-5 rounded-md border border-zinc-200 bg-white p-4 transition-colors hover:bg-zinc-50/50"
			>
				<div
					class="h-10 w-10 shrink-0 rounded border border-black/5 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]"
					style:background-color={color.hex}
				></div>
				<div class="min-w-0 flex-1">
					<div
						class="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
					>
						<div class="min-w-0">
							<p class="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase leading-none">
								{color.role}
							</p>
							<p class="mt-1 truncate text-sm font-bold text-black">{color.name}</p>
						</div>
						<div class="flex items-center gap-3">
							<code class="font-mono text-xs text-zinc-500">{color.hex}</code>
							<button 
								onclick={async () => {
									await navigator.clipboard.writeText(color.hex);
									clipboard.set(true);
								}}
								class="min-w-[48px] text-[10px] font-bold tracking-widest uppercase transition-colors"
								class:text-zinc-300={!clipboard.value}
								class:text-green-600={clipboard.value}
							>
								{clipboard.value ? 'Done' : 'Copy'}
							</button>
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>
</section>
