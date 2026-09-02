<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { UptimeDay, UptimeDayStatus } from '$lib/data/uptime';

	let {
		days,
		variant = 'overview',
		ariaLabel = 'Daily uptime history'
	}: {
		days: UptimeDay[];
		variant?: 'overview' | 'route';
		ariaLabel?: string;
	} = $props();

	let chart: HTMLDivElement | undefined = $state();
	let containerWidth = $state(0);
	let tooltipWidth = $state(0);
	let hovered = $state<{
		date: string;
		uptime: string;
		status: UptimeDayStatus;
		left: number;
		top: number;
	}>();

	const dateFormatter = new Intl.DateTimeFormat('en-US', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		timeZone: 'UTC'
	});

	const statusLabels: Record<UptimeDayStatus, string> = {
		operational: 'Operational',
		degraded: 'Degraded',
		outage: 'Outage',
		unknown: 'Verification delayed'
	};

	const tooltipLeft = $derived(
		hovered
			? Math.max(
					tooltipWidth / 2,
					Math.min(hovered.left, Math.max(tooltipWidth / 2, containerWidth - tooltipWidth / 2))
			  )
			: 0
	);

	function handlePointerOver(event: PointerEvent) {
		if (!chart || !(event.target instanceof HTMLElement)) return;

		const target = event.target.closest<HTMLElement>('[data-uptime-index]');
		if (!target || !chart.contains(target)) {
			hovered = undefined;
			return;
		}

		const index = Number(target.dataset.uptimeIndex);
		const day = days[index];
		if (!day) return;

		const targetRect = target.getBoundingClientRect();
		const chartRect = chart.getBoundingClientRect();

		hovered = {
			...day,
			left: targetRect.left - chartRect.left + targetRect.width / 2,
			top: targetRect.top - chartRect.top
		};
	}
</script>

<div
	class="uptime-chart uptime-chart--{variant}"
	bind:this={chart}
	bind:clientWidth={containerWidth}
	onpointerover={handlePointerOver}
	onpointerleave={() => (hovered = undefined)}
	role="presentation"
>
	<div class="uptime-bars" role="img" aria-label={ariaLabel}>
		{#each days as day, index (day.date)}
			<span
				data-uptime-index={index}
				data-status={day.status}
				aria-hidden="true"
				title={`${statusLabels[day.status]} · ${dateFormatter.format(new Date(day.date))}`}
			></span>
		{/each}
	</div>

	{#if hovered}
		<div
			class="uptime-island"
			role="tooltip"
			transition:fade={{ duration: 100 }}
			style:left={`${tooltipLeft}px`}
			style:top={`${hovered.top}px`}
			bind:clientWidth={tooltipWidth}
		>
			<span class="uptime-island__status" data-status={hovered.status}>
				<span class="uptime-island__dot" aria-hidden="true"></span>
				{hovered.uptime} uptime
			</span>
			<span class="uptime-island__date">{dateFormatter.format(new Date(hovered.date))}</span>
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
		grid-template-columns: repeat(90, minmax(0, 1fr));
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

	.uptime-bars span {
		min-width: 2px;
		border-radius: 2px;
		background: var(--status-positive);
	}

	.uptime-bars span[data-status='degraded'] {
		background: var(--status-warning);
	}

	.uptime-bars span[data-status='outage'] {
		background: var(--status-critical);
	}

	.uptime-bars span[data-status='unknown'] {
		background: var(--status-unknown-mark);
	}

	.uptime-island {
		position: absolute;
		z-index: 2;
		display: grid;
		gap: 2px;
		min-width: max-content;
		padding: 8px 10px;
		border: 1px solid var(--status-line);
		border-radius: 10px;
		background: var(--status-surface);
		color: var(--status-ink);
		pointer-events: none;
		transform: translate(-50%, calc(-100% - 8px));
		white-space: nowrap;
	}

	.uptime-island__status {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: var(--status-text-caption);
		font-weight: 500;
		font-variant-numeric: tabular-nums;
	}

	.uptime-island__date {
		color: var(--status-ink-soft);
		font-size: var(--status-text-caption);
		font-variant-numeric: tabular-nums;
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
		.uptime-bars span:hover {
			background: var(--status-positive-strong);
		}

		.uptime-bars span[data-status='degraded']:hover {
			background: var(--status-warning-strong);
		}

		.uptime-bars span[data-status='outage']:hover {
			background: var(--status-critical-strong);
		}
	}

	@media (max-width: 38.75rem) {
		.uptime-chart--overview .uptime-bars {
			grid-template-columns: repeat(45, minmax(0, 1fr));
			grid-auto-flow: row;
			height: 62px;
		}

		.uptime-chart--route .uptime-bars {
			grid-template-columns: repeat(45, minmax(0, 1fr));
			grid-auto-flow: row;
			height: 70px;
		}
	}
</style>
