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
	class="group flex w-full flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-5 text-left transition-all hover:border-black active:scale-[0.98]"
	class:border-black={selected}
	class:ring-1={selected}
	class:ring-black={selected}
	aria-pressed={selected}
	{onclick}
>
	<span class="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500">
		{option.category}
	</span>
	<strong class="text-base font-semibold text-black">{option.name}</strong>
	<span class="text-sm leading-relaxed text-zinc-500">
		{option.description}
	</span>
</button>
