<script lang="ts">
	import type { AccentOption } from '$lib/landing-generator/types';

	type Props = {
		option: AccentOption;
		selected?: boolean;
		onclick?: () => void;
	};

	let { option, selected = false, onclick }: Props = $props();
</script>

<button
	type="button"
	class="cursor-pointer rounded-md border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold tracking-tight text-zinc-500 transition-all hover:border-black hover:text-black active:scale-[0.98]"
	class:bg-black={selected}
	class:text-white={selected}
	class:border-black={selected}
	aria-pressed={selected}
	{onclick}
>
	<span>{option.name}</span>
</button>
