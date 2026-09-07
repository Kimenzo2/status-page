<script lang="ts">
	import type { UptimeDay, UptimeDayStatus } from '$lib/data/uptime';
	import { formatUptime, statusLabels } from '$lib/data/status';
	import { statusSite } from '$lib/config/site';

	let {
		days,
		variant = 'overview',
		ariaLabel = statusSite.copy.uptime.defaultAriaLabel,
		locale
	}: {
		days: UptimeDay[];
		variant?: 'overview' | 'route';
		ariaLabel?: string;
		locale?: string;
	} = $props();

	let chart: HTMLDivElement | undefined = $state();
	let containerWidth = $state(0);
	let tooltipWidth = $state(0);
	let activeIndex = $state(0);
	let hovered = $state<{
		date: string;
		uptime: UptimeDay['uptime'];
		status: UptimeDayStatus;
		note?: string;
		left: number;
		top: number;
	}>();

	const dateFormatter = $derived(new Intl.DateTimeFormat(locale ?? statusSite.locale, {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		timeZone: statusSite.timeZone
	}));

	const columnCount = $derived(Math.max(days.length, 1));
	const mobileColumnCount = $derived(Math.max(Math.ceil(days.length / 2), 1));

	function formatDayLabel(day: UptimeDay) {
		const uptime = day.uptime === null
			? statusSite.copy.uptime.unavailable
			: `${formatUptime(day.uptime)} ${statusSite.copy.uptime.metricSuffix}`;
		return [statusLabels[day.status], uptime, dateFormatter.format(new Date(day.date)), day.note]
			.filter(Boolean)
			.join(', ');
	}

	const tooltipLeft = $derived(
		hovered
			? Math.max(tooltipWidth / 2 + 12, Math.min(hovered.left, containerWidth - tooltipWidth / 2 - 12))
			: 0
	);

	function showDay(index: number, target: HTMLElement) {
		const day = days[index];
		if (!day || !chart) return;

		const targetRect = target.getBoundingClientRect();
		const chartRect = chart.getBoundingClientRect();

		hovered = {
			...day,
			left: targetRect.left - chartRect.left + targetRect.width / 2,
			top: targetRect.top - chartRect.top
		};
	}

	function showDayAt(index: number) {
		const target = chart?.querySelector<HTMLElement>(`[data-uptime-index="${index}"]`);
		if (target) showDay(index, target);
	}

	function handlePointerOver(event: PointerEvent) {
		if (!chart || !(event.target instanceof HTMLElement)) return;

		const target = event.target.closest<HTMLElement>('[data-uptime-index]');
		if (!target || !chart.contains(target)) return;

		showDay(Number(target.dataset.uptimeIndex), target);
	}

	function handleKeydown(event: KeyboardEvent, index: number) {
		const columns =
			typeof window !== 'undefined' && window.matchMedia('(max-width: 38.75rem)').matches
				? mobileColumnCount
				: columnCount;
		let nextIndex = index;

		switch (event.key) {
			case 'ArrowLeft':
				nextIndex = Math.max(0, index - 1);
				break;
			case 'ArrowRight':
				nextIndex = Math.min(days.length - 1, index + 1);
				break;
			case 'ArrowUp':
				nextIndex = Math.max(0, index - columns);
				break;
			case 'ArrowDown':
				nextIndex = Math.min(days.length - 1, index + columns);
				break;
			case 'Home':
				nextIndex = 0;
				break;
			case 'End':
				nextIndex = days.length - 1;
				break;
			default:
				return;
		}

		event.preventDefault();
		activeIndex = nextIndex;
		showDayAt(nextIndex);
		chart?.querySelector<HTMLElement>(`[data-uptime-index="${nextIndex}"]`)?.focus();
	}

	function handleFocusOut(event: FocusEvent) {
		if (!chart || (event.relatedTarget instanceof Node && chart.contains(event.relatedTarget))) return;
		hovered = undefined;
	}

	function handlePointerLeave() {
		if (!chart || !(document.activeElement instanceof Node) || !chart.contains(document.activeElement)) {
			hovered = undefined;
		}
	}
</script>

<div
	class="uptime-chart uptime-chart--{variant}"
	style={`--uptime-columns: ${columnCount}; --uptime-mobile-columns: ${mobileColumnCount};`}
	bind:this={chart}
	bind:clientWidth={containerWidth}
>
	<div
		class="uptime-bars"
		role="group"
		aria-label={ariaLabel}
		onpointerover={handlePointerOver}
		onpointerleave={handlePointerLeave}
		onfocusout={handleFocusOut}
	>
		{#each days as day, index (day.date)}
			<button
				type="button"
				class="uptime-cell"
				data-uptime-index={index}
				data-status={day.status}
				aria-label={formatDayLabel(day)}
				tabindex={index === activeIndex ? 0 : -1}
				onfocus={() => {
					activeIndex = index;
					showDayAt(index);
				}}
				onclick={() => {
					activeIndex = index;
					showDayAt(index);
				}}
				onkeydown={(event) => handleKeydown(event, index)}
			></button>
		{/each}
	</div>

	{#if hovered}
		<div
			class="uptime-island uptime-island--{variant}"
			aria-hidden="true"
			style:left={`${tooltipLeft}px`}
			style:top={`${hovered.top}px`}
			bind:clientWidth={tooltipWidth}
		>
			<span class="uptime-island__status" data-status={hovered.status}>
				<span class="uptime-island__dot" aria-hidden="true"></span>
				{statusLabels[hovered.status]}
			</span>
			{#if variant === 'route'}
				<span class="uptime-island__separator" aria-hidden="true">·</span>
				<span class="uptime-island__metric">{formatUptime(hovered.uptime)} {statusSite.copy.uptime.metricSuffix} · {dateFormatter.format(new Date(hovered.date))}</span>
			{:else}
				<span class="uptime-island__metric">{formatUptime(hovered.uptime)} {statusSite.copy.uptime.metricSuffix} · {dateFormatter.format(new Date(hovered.date))}</span>
				{#if hovered.note}
					<span class="uptime-island__note">{hovered.note}</span>
				{/if}
			{/if}
		</div>
	{/if}
</div>

<style>
	.uptime-chart {
		position: relative;
		width: 100%;
	}

	.uptime-bars {
		display: grid;
		grid-template-columns: repeat(var(--uptime-columns), minmax(0, 1fr));
		gap: 2px;
		align-items: stretch;
	}

	.uptime-chart--overview .uptime-bars {
		height: 48px;
	}

	.uptime-chart--route .uptime-bars {
		height: 56px;
		padding-top: 24px;
	}

	.uptime-cell {
		appearance: none;
		min-width: 2px;
		margin: 0;
		padding: 0;
		border: 0;
		border-radius: 2px;
		background: var(--status-positive);
		color: inherit;
		cursor: help;
		font: inherit;
	}

	.uptime-cell[data-status='degraded'] {
		background: var(--status-warning);
	}

	.uptime-cell[data-status='outage'] {
		background: var(--status-critical);
	}

	.uptime-cell[data-status='unknown'] {
		background: var(--status-unknown-mark);
	}

	.uptime-cell:focus-visible {
		position: relative;
		z-index: 1;
		outline: 2px solid var(--status-focus);
		outline-offset: 3px;
	}

	.uptime-island {
		position: absolute;
		z-index: 2;
		inline-size: min(300px, calc(100% - 24px));
		padding: 6px 9px;
		border: 1px solid var(--status-line);
		border-radius: 10px;
		background: var(--status-surface);
		color: var(--status-ink);
		font-size: var(--status-text-caption);
		line-height: 1.25;
		pointer-events: none;
		transform: translate(-50%, calc(-100% - 2px));
		white-space: normal;
	}

	.uptime-island--route {
		display: inline-flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 7px;
	}

	.uptime-island--route .uptime-island__metric {
		white-space: normal;
		overflow-wrap: break-word;
	}

	.uptime-island--overview {
		display: grid;
		gap: 2px;
	}

	.uptime-island__status {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-width: 0;
		font-weight: 500;
		font-variant-numeric: tabular-nums;
		text-wrap: pretty;
		overflow-wrap: break-word;
	}

	.uptime-island__separator {
		color: var(--status-ink-faint);
		font-variant-numeric: tabular-nums;
	}

	.uptime-island__metric {
		min-width: 0;
		color: var(--status-ink-soft);
		font-variant-numeric: tabular-nums;
		white-space: normal;
		overflow-wrap: anywhere;
	}

	.uptime-island__note {
		min-width: 0;
		color: var(--status-ink);
		overflow-wrap: break-word;
		text-wrap: pretty;
	}

	.uptime-island__dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--status-positive);
	}

	.uptime-island__status[data-status='degraded'] .uptime-island__dot {
		background: var(--status-warning);
	}

	.uptime-island__status[data-status='outage'] .uptime-island__dot {
		background: var(--status-critical);
	}

	.uptime-island__status[data-status='unknown'] .uptime-island__dot {
		background: var(--status-unknown);
	}

	@media (hover: hover) {
		.uptime-cell:hover {
			background: var(--status-positive-strong);
		}

		.uptime-cell[data-status='degraded']:hover {
			background: var(--status-warning-strong);
		}

		.uptime-cell[data-status='outage']:hover {
			background: var(--status-critical-strong);
		}
	}

	@media (max-width: 38.75rem) {
		.uptime-chart--overview .uptime-bars {
			grid-template-columns: repeat(var(--uptime-mobile-columns), minmax(0, 1fr));
			grid-auto-flow: row;
			height: 62px;
		}

		.uptime-chart--route .uptime-bars {
			grid-template-columns: repeat(var(--uptime-mobile-columns), minmax(0, 1fr));
			grid-auto-flow: row;
			height: 70px;
		}
	}
</style>
