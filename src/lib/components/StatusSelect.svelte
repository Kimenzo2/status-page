<script lang="ts">
	import { onMount, tick } from 'svelte';

	type Props = {
		id: string;
		label: string;
		options: readonly string[];
		value: string;
		onValueChange: (value: string) => void;
	};

	let { id, label, options, value, onValueChange }: Props = $props();

	let root: HTMLDivElement;
	let trigger: HTMLButtonElement;
	let optionElements: HTMLDivElement[] = [];
	let open = $state(false);
	let highlightedIndex = $state(0);

	let labelId = $derived(`${id}-label`);
	let valueId = $derived(`${id}-value`);
	let listboxId = $derived(`${id}-listbox`);

	let selectedLabel = $derived(options.includes(value) ? value : (options[0] ?? ''));
	let selectedIndex = $derived(Math.max(0, options.indexOf(value)));

	onMount(() => {
		const handlePointerDown = (event: PointerEvent) => {
			if (open && root && !root.contains(event.target as Node)) {
				closeMenu(false);
			}
		};

		document.addEventListener('pointerdown', handlePointerDown);
		return () => document.removeEventListener('pointerdown', handlePointerDown);
	});

	function focusOption(index: number) {
		if (!options.length) return;
		highlightedIndex = Math.min(Math.max(index, 0), options.length - 1);
		optionElements[highlightedIndex]?.focus();
	}

	function openMenu() {
		if (!options.length) return;
		highlightedIndex = selectedIndex;
		open = true;
		tick().then(() => optionElements[highlightedIndex]?.focus());
	}

	function closeMenu(restoreFocus = true) {
		open = false;
		if (restoreFocus) tick().then(() => trigger?.focus());
	}

	function selectOption(option: string) {
		onValueChange(option);
		closeMenu();
	}

	function handleTriggerKeydown(event: KeyboardEvent) {
		switch (event.key) {
			case 'ArrowDown':
			case 'ArrowUp':
				event.preventDefault();
				if (!open) openMenu();
				break;
			case 'Enter':
			case ' ':
				event.preventDefault();
				open ? closeMenu() : openMenu();
				break;
			case 'Escape':
				if (open) {
					event.preventDefault();
					closeMenu();
				}
				break;
		}
	}

	function handleOptionKeydown(event: KeyboardEvent, index: number) {
		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				focusOption((index + 1) % options.length);
				break;
			case 'ArrowUp':
				event.preventDefault();
				focusOption((index - 1 + options.length) % options.length);
				break;
			case 'Home':
				event.preventDefault();
				focusOption(0);
				break;
			case 'End':
				event.preventDefault();
				focusOption(options.length - 1);
				break;
			case 'Enter':
			case ' ':
				event.preventDefault();
				selectOption(options[index]);
				break;
			case 'Escape':
				event.preventDefault();
				closeMenu();
				break;
			case 'Tab':
				closeMenu(false);
				break;
		}
	}
</script>

<div class="status-select" bind:this={root}>
	<span class="status-select__label" id={labelId}>{label}</span>
	<button
		id={id}
		class="status-select__trigger"
		type="button"
		role="combobox"
		aria-haspopup="listbox"
		aria-expanded={open}
		aria-controls={open ? listboxId : undefined}
		aria-labelledby={`${labelId} ${valueId}`}
		onclick={() => (open ? closeMenu(false) : openMenu())}
		onkeydown={handleTriggerKeydown}
		bind:this={trigger}
	>
		<span id={valueId}>{selectedLabel}</span>
		<span class:open class="status-select__chevron" aria-hidden="true"></span>
	</button>

	{#if open}
		<div class="status-select__menu" id={listboxId} role="listbox" aria-labelledby={labelId} tabindex="-1">
			{#each options as option, index}
				<div
					class:highlighted={highlightedIndex === index}
					class:selected={value === option}
					class="status-select__option"
					id={`${id}-option-${index}`}
					role="option"
					aria-selected={value === option}
					tabindex="-1"
					onclick={() => selectOption(option)}
					onkeydown={(event) => handleOptionKeydown(event, index)}
					onfocus={() => (highlightedIndex = index)}
					bind:this={optionElements[index]}
				>
					<span>{option}</span>
					<span class="status-select__check" aria-hidden="true">{value === option ? '✓' : ''}</span>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.status-select {
		display: grid;
		position: relative;
		gap: 8px;
	}

	.status-select__label {
		color: var(--status-ink-soft);
		font-size: var(--status-text-caption);
		font-weight: 650;
	}

	.status-select__trigger {
		display: flex;
		width: 100%;
		min-height: 46px;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding: 0 16px 0 13px;
		border: 1px solid var(--status-line);
		border-radius: var(--status-radius-control);
		background: transparent;
		color: var(--status-ink);
		cursor: pointer;
		font: inherit;
		font-size: var(--status-text-body);
		text-align: start;
	}

	.status-select__trigger[aria-expanded='true'] {
		border-color: var(--status-ink-faint);
	}

	.status-select__chevron {
		width: 9px;
		height: 9px;
		flex: 0 0 auto;
		border-inline-end: 1px solid var(--status-ink-soft);
		border-block-end: 1px solid var(--status-ink-soft);
		transform: rotate(45deg) translate(-2px, -2px);
		transition: transform 160ms ease-out;
	}

	.status-select__chevron.open {
		transform: rotate(225deg) translate(-1px, -1px);
	}

	.status-select__menu {
		display: grid;
		position: absolute;
		top: calc(100% + 8px);
		inset-inline: 0;
		z-index: 20;
		max-height: min(280px, 50vh);
		gap: 2px;
		padding: 4px;
		overflow-y: auto;
		border: 1px solid var(--status-line);
		border-radius: var(--status-radius-surface);
		background: var(--status-canvas);
		box-shadow: 0 14px 32px var(--status-shadow);
	}

	.status-select__option {
		display: flex;
		min-height: 40px;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding: 0 12px;
		border-radius: var(--status-radius-control);
		background: transparent;
		color: var(--status-ink-soft);
		cursor: pointer;
		font-size: var(--status-text-body);
		line-height: 1.2;
		outline: 0;
	}

	.status-select__option.highlighted {
		background: color-mix(in oklab, var(--status-ink) 8%, transparent);
		color: var(--status-ink);
	}

	.status-select__option.selected {
		color: var(--status-ink);
		font-weight: 650;
	}

	.status-select__option:focus-visible {
		outline: 1px solid var(--status-focus);
		outline-offset: -1px;
	}

	.status-select__check {
		min-width: 1em;
		color: var(--status-ink-soft);
		font-size: var(--status-text-ui);
		font-weight: 700;
		text-align: center;
	}

	@media (prefers-reduced-motion: reduce) {
		.status-select__chevron {
			transition: none;
		}
	}
</style>
