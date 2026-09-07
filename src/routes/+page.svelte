<script lang="ts">
	import IncidentSummary from '$lib/components/IncidentSummary.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import { page } from '$app/state';
	import { statusSite } from '$lib/config/site';
	import { demoIncidents, getActiveIncident } from '$lib/data/incidents';
	import {
		demoServices,
		demoStatusSnapshot,
		formatCopy,
		formatServiceDetail,
		formatUptime,
		getAverageUptime,
		getOverallStatus,
		statusLabels,
		statusSymbols
	} from '$lib/data/status';
	import { demoUptimeDays, getServiceUptimeDays } from '$lib/data/uptime';
	import {
		demoMaintenanceEvents,
		maintenanceCalendarEnd,
		maintenanceCalendarStart
	} from '$lib/data/maintenance';
	import MaintenanceCalendar from '$lib/components/MaintenanceCalendar.svelte';
	import UptimeBars from '$lib/components/UptimeBars.svelte';

	const overallStatus = getOverallStatus(demoServices);
	const overallUptime = getAverageUptime(demoUptimeDays);
	const activeIncident = getActiveIncident(demoIncidents);
	const verifiedDateFormatter = new Intl.DateTimeFormat(statusSite.locale, {
		dateStyle: 'long',
		timeStyle: 'short',
		timeZone: statusSite.timeZone
	});
	const verifiedAt = verifiedDateFormatter.format(new Date(demoStatusSnapshot.lastVerified));
	let servicesOpen = $state(true);
	let siteName = $derived(page.data.tenant?.record?.displayName ?? statusSite.name);
	const statusCardCopy = statusSite.copy.overview.statusCard[overallStatus];
</script>

<svelte:head>
	<title>{formatCopy(statusSite.copy.pageTitle, { title: statusSite.copy.overview.title, site: siteName })}</title>
	<meta name="description" content={formatCopy(statusSite.copy.overview.metaDescription, { site: siteName })} />
</svelte:head>

<main id="main-content" class="overview-page">
	<div class="overview-container">
		<section class="service-health-card" data-status={overallStatus} aria-labelledby="service-health-title">
			<span class="service-health-card__icon" data-status={overallStatus} aria-hidden="true">
				<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
					<circle cx="12" cy="12" r="7.5" />
					{#if overallStatus === 'operational'}
						<path d="m8.5 12.2 2.2 2.2 4.8-5" />
					{:else if overallStatus === 'degraded'}
						<path d="M12 8.5v4" /><path d="M12 16h.01" />
					{:else if overallStatus === 'outage'}
						<path d="m9.5 9.5 5 5" /><path d="m14.5 9.5-5 5" />
					{:else}
						<path d="M9.5 9.5a2.5 2.5 0 1 1 4.1 1.9c-.9.7-1.6 1.1-1.6 2.6" /><path d="M12 16h.01" />
					{/if}
				</svg>
			</span>
			<div class="service-health-card__copy">
				<h1 id="service-health-title">{statusCardCopy.title}</h1>
				<p>{statusCardCopy.summary}</p>
			</div>
		</section>

		{#if activeIncident}
			<IncidentSummary incident={activeIncident} basePath={page.data.tenant ? `/${page.data.tenant.slug}` : ''} />
		{:else}
			<EmptyState state={statusSite.copy.emptyStates.overviewIncidents} compact />
		{/if}

		<section class="service-group" aria-labelledby="services-title">
			<button class="service-group__header" type="button" aria-expanded={servicesOpen} aria-controls="service-group-details" onclick={() => (servicesOpen = !servicesOpen)}>
				<span class="service-group__name" id="services-title">{siteName}</span>
				<span class="service-group__status"><span class="status-check" data-status={overallStatus} aria-hidden="true">{statusSymbols[overallStatus]}</span> {statusLabels[overallStatus]} <span class:rotated={servicesOpen} class="chevron" aria-hidden="true"></span></span>
			</button>

			{#if servicesOpen}
				<div id="service-group-details" class="service-group__body">
					<div class="uptime-heading">
						<div class="uptime-label"><span class="status-check" data-status={overallStatus} aria-hidden="true">{statusSymbols[overallStatus]}</span><strong>{siteName}</strong></div>
						<strong>{formatCopy(statusSite.copy.overview.uptimeLabel, { uptime: formatUptime(overallUptime, 0) })}</strong>
					</div>
					{#if demoUptimeDays.length}
						<UptimeBars days={demoUptimeDays} variant="overview" ariaLabel={formatCopy(statusSite.copy.overview.uptimeAriaLabel, { days: demoUptimeDays.length, status: statusLabels[overallStatus].toLowerCase(), site: siteName })} locale={statusSite.locale} />
						<div class="uptime-scale"><span>{formatCopy(statusSite.copy.timeRange.ago, { days: demoUptimeDays.length })}</span><span>{statusSite.copy.timeRange.today}</span></div>
					{:else}
						<EmptyState state={statusSite.copy.emptyStates.uptime} compact />
					{/if}
					<MaintenanceCalendar
						events={demoMaintenanceEvents}
						startDate={maintenanceCalendarStart}
						endDate={maintenanceCalendarEnd}
						basePath={page.data.tenant ? `/${page.data.tenant.slug}` : ''}
					/>

					{#if demoServices.length}
						<div class="service-list">
							{#each demoServices as service (service.id)}
								{@const serviceDays = getServiceUptimeDays(service.id, service.status, service.uptime)}
								<details class="service-row" data-status={service.status}>
									<summary>
										<span>{service.name}</span>
										<span class="service-row__status"><span class="status-check" data-status={service.status} aria-hidden="true">{statusSymbols[service.status]}</span> {statusLabels[service.status]} <span class="row-chevron" aria-hidden="true"></span></span>
									</summary>
									<div class="service-row__details">
										<p>{formatServiceDetail(service)}</p>
										<div class="service-row__uptime">
											<strong class="service-row__uptime-value">{formatCopy(statusSite.copy.overview.uptimeLabel, { uptime: formatUptime(service.uptime, 0) })}</strong>
											{#if serviceDays.length}
												<UptimeBars
													days={serviceDays}
													variant="overview"
													ariaLabel={formatCopy(statusSite.copy.overview.uptimeAriaLabel, { days: serviceDays.length, status: statusLabels[service.status].toLowerCase(), site: service.name })}
													locale={statusSite.locale}
												/>
													<div class="service-row__uptime-scale"><span>{formatCopy(statusSite.copy.timeRange.ago, { days: serviceDays.length })}</span><span>{statusSite.copy.timeRange.today}</span></div>
											{:else}
												<EmptyState state={statusSite.copy.emptyStates.uptime} compact />
											{/if}
										</div>
									</div>
								</details>
							{/each}
						</div>
					{:else}
						<EmptyState state={statusSite.copy.emptyStates.overviewServices} compact />
					{/if}
				</div>
			{/if}
		</section>

	</div>
</main>

<style>
	.overview-page {
		min-height: calc(100dvh - 72px);
		padding: 16px 24px 90px;
		background: var(--status-canvas);
	}

	.overview-container {
		width: min(100%, var(--status-content-width));
		margin-inline: auto;
	}

	.service-health-card {
		display: flex;
		width: 100%;
		max-width: 820px;
		align-items: center;
		gap: 12px;
		margin: 32px auto 24px;
		padding: 20px;
		border-radius: 24px;
		background: var(--status-surface);
		color: var(--status-ink);
	}

	.service-group {
		overflow: hidden;
		border: 1px solid var(--status-line);
		border-radius: var(--status-radius-panel);
		background: transparent;
	}

	.service-group__header {
		display: flex;
		width: 100%;
		min-height: 78px;
		align-items: center;
		justify-content: space-between;
		gap: 18px;
		padding: 0 26px;
		border: 0;
		background: inherit;
		color: var(--status-ink);
		cursor: pointer;
		font: inherit;
		text-align: start;
	}

	.service-group__name {
		font-size: var(--status-text-title-sm);
		font-weight: 500;
		letter-spacing: -0.02em;
	}

	.service-group__status,
	.service-row__status {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		color: var(--status-ink);
		font-size: var(--status-text-ui-lg);
		font-weight: 400;
		white-space: nowrap;
	}

	.service-health-card__icon {
		display: grid;
		width: 40px;
		height: 40px;
		flex: 0 0 40px;
		place-items: center;
		border-radius: 50%;
		background: color-mix(in oklab, var(--status-positive) 15%, transparent);
		color: var(--status-positive);
	}

	.service-health-card__icon svg {
		width: 20px;
		height: 20px;
		fill: none;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 1.8;
	}

	.service-health-card[data-status='degraded'] .service-health-card__icon {
		background: color-mix(in oklab, var(--status-warning) 15%, transparent);
		color: var(--status-warning);
	}

	.service-health-card[data-status='outage'] .service-health-card__icon {
		background: color-mix(in oklab, var(--status-critical) 15%, transparent);
		color: var(--status-critical);
	}

	.service-health-card[data-status='unknown'] .service-health-card__icon {
		background: color-mix(in oklab, var(--status-ink-soft) 15%, transparent);
		color: var(--status-ink-soft);
	}

	.service-health-card__copy {
		min-width: 0;
	}

	.service-health-card__copy h1 {
		margin: 0;
		color: var(--status-ink);
		font-size: var(--status-text-card-title);
		font-weight: 500;
		letter-spacing: -0.032em;
		line-height: 1.1;
		text-wrap: balance;
	}

	.service-health-card__copy p {
		margin: 4px 0 0;
		color: var(--status-ink-soft);
		font-size: var(--status-text-card-summary);
		line-height: 1.4;
		opacity: 0.7;
		overflow-wrap: break-word;
		text-wrap: pretty;
	}

	.status-check {
		display: inline-grid;
		width: 20px;
		height: 20px;
		place-items: center;
		border-radius: 50%;
		background: var(--status-positive);
		color: var(--status-on-positive);
		font-size: var(--status-text-ui);
		font-weight: 600;
		line-height: 1;
	}

	.status-check[data-status='degraded'] {
		background: var(--status-warning);
		color: var(--status-on-warning);
	}

	.status-check[data-status='outage'] {
		background: var(--status-critical);
		color: var(--status-on-critical);
	}

	.status-check[data-status='unknown'] {
		background: var(--status-surface-muted);
		color: var(--status-ink);
	}

	.chevron,
	.row-chevron {
		display: inline-block;
		width: 8px;
		height: 8px;
		flex: 0 0 auto;
		border-inline-end: 1px solid var(--status-ink-faint);
		border-block-end: 1px solid var(--status-ink-faint);
		pointer-events: none;
	}

	.chevron {
		transform: rotate(45deg) translate(-2px, -2px);
	}

	.chevron.rotated {
		transform: rotate(225deg) translate(-1px, -1px);
	}

	.row-chevron {
		transform: rotate(-45deg) translate(-1px, -1px);
	}

	.service-group__body {
		padding: 0 26px 26px;
	}

	.uptime-heading,
	.uptime-scale,
	.service-row summary {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 18px;
	}

	.uptime-heading {
		padding: 24px 0 16px;
		border-top: 1px solid var(--status-line-soft);
		color: var(--status-positive-strong);
		font-size: var(--status-text-ui-lg);
		font-variant-numeric: tabular-nums;
	}

	.uptime-label {
		display: inline-flex;
		align-items: center;
		gap: 9px;
		color: var(--status-ink);
	}

	.uptime-label .status-check {
		width: 18px;
		height: 18px;
		font-size: var(--status-text-caption);
	}

	.uptime-heading > strong {
		font-weight: 600;
	}

	.uptime-scale {
		padding-top: 12px;
		color: var(--status-ink-soft);
		font-size: var(--status-text-ui);
	}

	.service-list {
		display: grid;
		gap: 10px;
		padding-top: 26px;
	}

	.service-row {
		overflow: hidden;
		border: 1px solid var(--status-line-soft);
		border-radius: var(--status-radius-row);
		background: transparent;
	}

	.service-row summary {
		min-height: 66px;
		padding: 0 18px 0 24px;
		color: var(--status-ink);
		cursor: pointer;
		font-size: var(--status-text-body);
		list-style: none;
	}

	.service-row summary::-webkit-details-marker {
		display: none;
	}

	.service-row summary:focus-visible {
		outline: 2px solid var(--status-focus);
		outline-offset: -3px;
	}

	.service-row__status {
		font-size: var(--status-text-ui-lg);
	}

	.service-row__status .status-check {
		width: 19px;
		height: 19px;
		font-size: 12px;
	}

	.service-row[open] .row-chevron {
		transform: rotate(45deg) translate(-1px, -1px);
	}

	.service-row__details {
		padding: 0 24px 18px;
	}

	.service-row p {
		margin: 0;
		max-width: 60ch;
		color: var(--status-ink-soft);
		font-size: var(--status-text-ui);
		line-height: 1.5;
		overflow-wrap: break-word;
		text-wrap: pretty;
	}

	.service-row__uptime {
		margin-top: 18px;
	}

	.service-row__uptime-value {
		display: block;
		margin-bottom: 10px;
		color: var(--status-positive-strong);
		font-size: var(--status-text-ui-lg);
		font-variant-numeric: tabular-nums;
		font-weight: 600;
		text-align: end;
	}

	.service-row[data-status='degraded'] .service-row__uptime-value {
		color: var(--status-warning-strong);
	}

	.service-row[data-status='outage'] .service-row__uptime-value {
		color: var(--status-critical-strong);
	}

	.service-row[data-status='unknown'] .service-row__uptime-value {
		color: var(--status-ink-soft);
	}

	.service-row__uptime-scale {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-top: 10px;
		color: var(--status-ink-soft);
		font-size: var(--status-text-ui);
	}

	@media (max-width: 38.75rem) {
		.overview-page {
			padding: 12px 16px 58px;
		}

		.service-health-card {
			margin-top: 24px;
		}

		.service-health-card__copy h1 {
			font-size: var(--status-text-card-title-mobile);
		}

		.service-health-card__copy p {
			font-size: var(--status-text-body);
		}

		.service-group__body {
			padding-inline: 18px;
		}

		.service-group__header {
			min-height: 68px;
			padding-inline: 18px;
		}

		.service-group__status {
			font-size: var(--status-text-caption);
		}

		.service-row summary {
			min-height: 60px;
			padding-inline: 16px 12px;
			font-size: var(--status-text-ui-lg);
		}

		.service-row__status {
			gap: 5px;
			font-size: var(--status-text-caption);
		}

		.service-row__status .status-check {
			width: 17px;
			height: 17px;
		}

		.service-row__details {
			padding-inline: 16px;
		}

	}

	@media (prefers-reduced-motion: no-preference) {
		.row-chevron {
			transition: transform 150ms ease-out;
		}

	}
</style>
