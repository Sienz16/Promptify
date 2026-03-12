<script lang="ts">
	import type { StyleOption } from '$lib/landing-generator/types';

	type Props = {
		option: StyleOption;
		selected?: boolean;
		onclick?: () => void;
	};

	let { option, selected = false, onclick }: Props = $props();
</script>

<button
	type="button"
	class="group flex w-full flex-col gap-3 rounded-md border border-zinc-200 bg-white p-6 text-left transition-all hover:border-black active:scale-[0.99] hover:bg-zinc-50/50"
	class:border-black={selected}
	class:bg-zinc-50={selected}
	class:ring-[0.5px]={selected}
	class:ring-black={selected}
	aria-pressed={selected}
	{onclick}
>
	<span class="text-[10px] font-bold tracking-[0.24em] uppercase text-zinc-400">
		{option.category}
	</span>
	<div class="space-y-1.5">
		<strong class="text-base font-bold tracking-tight text-black">{option.name}</strong>
		<p class="text-xs leading-relaxed text-zinc-500">
			{option.description}
		</p>
	</div>
</button>
