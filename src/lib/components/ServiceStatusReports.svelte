<script lang="ts">
	import EmptyState from '$lib/components/EmptyState.svelte';
	import UptimeBars from '$lib/components/UptimeBars.svelte';
	import { statusSite } from '$lib/config/site';
	import type { UptimeDay } from '$lib/config/models';
	import {
		formatCopy,
		formatServiceDetail,
		formatUptime,
		getOverallStatus,
		statusLabels,
		statusSymbols,
		type StatusService
	} from '$lib/data/status';
	import { getServiceUptimeDays } from '$lib/data/uptime';

	type Props = {
		id: string;
		heading: string;
		services: StatusService[];
		variant?: 'overview' | 'route';
		defaultOpen?: boolean;
	};

	let {
		id,
		heading,
		services,
		variant = 'overview',
		defaultOpen = true
	}: Props = $props();

	let open = $state(true);
	let groupStatus = $derived(getOverallStatus(services));
	let affectedCount = $derived(
		services.filter((service) => service.status === 'degraded' || service.status === 'outage').length
	);
	let countLabel = $derived(
		affectedCount
			? formatCopy(statusSite.copy.serviceGroup.affectedCount, { count: affectedCount })
			: formatCopy(statusSite.copy.serviceGroup.totalCount, { count: services.length })
	);

	let headingId = $derived(`${id}-heading`);
	let panelId = $derived(`${id}-panel`);

	$effect(() => {
		open = defaultOpen;
	});

	function formatServiceUptime(value: number | null) {
		return formatUptime(value, variant === 'route' ? 2 : 0);
	}

	function uptimeAriaLabel(service: StatusService, days: UptimeDay[]) {
		const template = variant === 'route'
			? statusSite.copy.uptime.uptimeAriaLabel
			: statusSite.copy.overview.uptimeAriaLabel;

		return formatCopy(template, {
			days: days.length,
			status: statusLabels[service.status].toLowerCase(),
			site: service.name
		});
	}
</script>

<section class="service-reports service-reports--{variant}" aria-labelledby={headingId}>
	<button
		class="service-reports__toggle"
		type="button"
		aria-expanded={open}
		aria-controls={panelId}
		onclick={() => (open = !open)}
	>
		<span class="service-reports__toggle-copy">
			<span class="service-reports__heading" id={headingId}>{heading}</span>
			<span class="service-reports__count">{countLabel}</span>
		</span>
		<span class="service-reports__status">
			<span class="service-status-mark" data-status={groupStatus} aria-hidden="true">{statusSymbols[groupStatus]}</span>
			<span>{statusLabels[groupStatus]}</span>
			<span class:rotated={open} class="service-reports__chevron" aria-hidden="true"></span>
		</span>
	</button>

	{#if open}
		<div class="service-reports__panel" id={panelId} role="region" aria-labelledby={headingId}>
			{#if services.length}
				<div class="service-reports__list">
					{#each services as service (service.id)}
						{@const serviceDays = getServiceUptimeDays(service.id, service.status, service.uptime)}
						<article class="service-report" data-status={service.status}>
							<div class="service-report__topline">
								<div class="service-report__identity">
									<span class="service-status-mark" data-status={service.status} aria-hidden="true">{statusSymbols[service.status]}</span>
									<h3>{service.name}</h3>
								</div>
								<strong class="service-report__uptime">
									{formatCopy(statusSite.copy.overview.uptimeLabel, { uptime: formatServiceUptime(service.uptime) })}
								</strong>
							</div>
							{@render serviceReportBody(service, serviceDays)}
						</article>
					{/each}
				</div>
			{:else}
				<EmptyState state={statusSite.copy.emptyStates.serviceJourneys} compact />
			{/if}
		</div>
	{/if}
	</section>

{#snippet serviceReportBody(service: StatusService, serviceDays: UptimeDay[])}
	<p class="service-report__detail">{formatServiceDetail(service)}</p>

	{#if serviceDays.length}
		<div class="service-report__chart">
			<UptimeBars
				days={serviceDays}
				variant={variant}
				ariaLabel={uptimeAriaLabel(service, serviceDays)}
				locale={statusSite.locale}
			/>
			<div class="service-report__scale">
				<span>{formatCopy(statusSite.copy.timeRange.ago, { days: serviceDays.length })}</span>
				<span>{statusSite.copy.timeRange.today}</span>
			</div>
		</div>
	{:else}
		<EmptyState state={statusSite.copy.emptyStates.uptime} compact />
	{/if}
{/snippet}

<style>
	.service-reports {
		margin-top: 28px;
	}

	.service-reports--route {
		margin-top: 64px;
	}

	.service-reports__toggle {
		display: flex;
		width: 100%;
		min-height: 62px;
		align-items: center;
		justify-content: space-between;
		gap: 18px;
		padding: 15px 0;
		border: 0;
		border-block: 1px solid var(--status-line-soft);
		background: transparent;
		color: var(--status-ink);
		cursor: pointer;
		font: inherit;
		text-align: start;
	}

	.service-reports__toggle:focus-visible {
		outline: 2px solid var(--status-focus);
		outline-offset: 4px;
	}

	.service-reports__toggle-copy {
		display: flex;
		min-width: 0;
		align-items: baseline;
		flex: 1 1 12rem;
		flex-wrap: wrap;
		gap: 6px 16px;
	}

	.service-reports__heading {
		font-size: var(--status-text-title-sm);
		font-weight: 500;
		letter-spacing: -0.02em;
	}

	.service-reports__count {
		color: var(--status-ink-faint);
		font-size: var(--status-text-ui);
		font-variant-numeric: tabular-nums;
	}

	.service-reports__status {
		display: inline-flex;
		flex: 0 1 auto;
		align-items: center;
		gap: 8px;
		color: var(--status-ink);
		font-size: var(--status-text-ui-lg);
		font-weight: 400;
		white-space: nowrap;
	}

	.service-status-mark {
		display: inline-grid;
		width: 20px;
		height: 20px;
		flex: 0 0 auto;
		place-items: center;
		border-radius: 50%;
		background: var(--status-positive);
		color: var(--status-on-positive);
		font-size: var(--status-text-ui);
		font-weight: 600;
		line-height: 1;
	}

	.service-status-mark[data-status='degraded'] {
		background: var(--status-warning);
		color: var(--status-on-warning);
	}

	.service-status-mark[data-status='outage'] {
		background: var(--status-critical);
		color: var(--status-on-critical);
	}

	.service-status-mark[data-status='unknown'] {
		background: var(--status-surface-muted);
		color: var(--status-ink);
	}

	.service-reports__chevron {
		display: inline-block;
		width: 8px;
		height: 8px;
		flex: 0 0 auto;
		border-inline-end: 1px solid var(--status-ink-faint);
		border-block-end: 1px solid var(--status-ink-faint);
		pointer-events: none;
		transform: rotate(45deg) translate(-2px, -2px);
	}

	.service-reports__chevron.rotated {
		transform: rotate(225deg) translate(-1px, -1px);
	}

	.service-reports__panel {
		padding-inline: 2px;
	}

	.service-report {
		padding: 26px 0 28px;
		border-bottom: 1px solid var(--status-line-soft);
	}

	.service-report:last-child {
		border-bottom: 0;
	}

	.service-report__topline {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 18px;
	}

	.service-report__identity {
		display: inline-flex;
		min-width: 0;
		align-items: center;
		gap: 10px;
	}

	.service-report__identity h3 {
		min-width: 0;
		margin: 0;
		color: var(--status-ink);
		font-size: var(--status-text-title-sm);
		font-weight: 500;
		letter-spacing: -0.02em;
		text-wrap: pretty;
	}

	.service-report__uptime {
		flex: 0 0 auto;
		color: var(--status-positive-strong);
		font-size: var(--status-text-ui-lg);
		font-variant-numeric: tabular-nums;
		font-weight: 600;
		text-align: end;
		white-space: nowrap;
	}

	.service-report[data-status='degraded'] .service-report__uptime {
		color: var(--status-warning-strong);
	}

	.service-report[data-status='outage'] .service-report__uptime {
		color: var(--status-critical-strong);
	}

	.service-report[data-status='unknown'] .service-report__uptime {
		color: var(--status-ink-soft);
	}

	.service-report__detail {
		max-width: 60ch;
		margin: 11px 0 0;
		color: var(--status-ink-soft);
		font-size: var(--status-text-ui);
		line-height: 1.5;
		text-wrap: pretty;
	}

	.service-report__chart {
		margin-top: 18px;
	}

	.service-report__scale {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 18px;
		padding-top: 10px;
		color: var(--status-ink-soft);
		font-size: var(--status-text-ui);
		font-variant-numeric: tabular-nums;
	}

	@media (max-width: 38.75rem) {
		.service-reports {
			margin-top: 24px;
		}

		.service-reports--route {
			margin-top: 48px;
		}

		.service-reports__toggle {
			align-items: flex-start;
			padding-block: 14px;
		}

		.service-reports__status {
			gap: 6px;
			font-size: var(--status-text-caption);
		}

		.service-report {
			padding-block: 22px 24px;
		}

		.service-report__topline {
			align-items: flex-start;
			gap: 12px;
		}

		.service-report__identity {
			gap: 8px;
		}

		.service-report__identity h3,
		.service-report__uptime {
			font-size: var(--status-text-ui-lg);
		}

		.service-report__detail {
			font-size: var(--status-text-ui);
		}
	}

	@media (prefers-reduced-motion: no-preference) {
		.service-reports__chevron {
			transition: transform 150ms ease-out;
		}
	}
</style>
