<script lang="ts">
	import EmptyState from '$lib/components/EmptyState.svelte';
	import { page } from '$app/state';
	import { statusSite } from '$lib/config/site';
	import {
		demoServices,
		demoStatusSnapshot,
		formatCopy,
		formatUptime,
		getAverageUptime,
		getOverallStatus,
		statusLabels
	} from '$lib/data/status';
	import { demoUptimeDays } from '$lib/data/uptime';
	import ServiceStatusReports from '$lib/components/ServiceStatusReports.svelte';
	import UptimeBars from '$lib/components/UptimeBars.svelte';

	const overallStatus = getOverallStatus(demoServices);
	const overallUptime = getAverageUptime(demoUptimeDays);
	const verifiedDateFormatter = new Intl.DateTimeFormat(statusSite.locale, {
		dateStyle: 'long',
		timeStyle: 'short',
		timeZone: statusSite.timeZone
	});
	const verifiedAt = verifiedDateFormatter.format(new Date(demoStatusSnapshot.lastVerified));
	let siteName = $derived(page.data.tenant?.record?.displayName ?? statusSite.name);
</script>


<svelte:head>
	<title>{formatCopy(statusSite.copy.pageTitle, { title: statusSite.copy.uptime.title, site: siteName })}</title>
	<meta name="description" content={formatCopy(statusSite.copy.uptime.metaDescription, { site: siteName, period: formatCopy(statusSite.copy.uptime.period, { days: demoUptimeDays.length }) })} />
</svelte:head>

<main id="main-content" class="route-page">
	<div class="route-container">
		<header class="route-header">
			<h1>{statusSite.copy.uptime.title}</h1>
			<p>{formatCopy(statusSite.copy.uptime.description, { site: siteName })}</p>
		</header>

		<section class="route-block uptime-summary" aria-labelledby="uptime-summary-title">
			<div class="uptime-summary__heading">
				<h2 id="uptime-summary-title">{siteName}</h2>
				<strong>{formatUptime(overallUptime)}</strong>
			</div>
			{#if demoUptimeDays.length}
				<UptimeBars days={demoUptimeDays} variant="route" ariaLabel={formatCopy(statusSite.copy.uptime.uptimeAriaLabel, { days: demoUptimeDays.length, status: statusLabels[overallStatus].toLowerCase(), site: siteName })} locale={statusSite.locale} />
				<div class="uptime-scale"><span>{formatCopy(statusSite.copy.timeRange.ago, { days: demoUptimeDays.length })}</span><span>{statusSite.copy.timeRange.today}</span></div>
			{:else}
				<EmptyState state={statusSite.copy.emptyStates.uptime} compact />
			{/if}
			<p class="uptime-verified">{statusSite.copy.uptime.verified} {verifiedAt}</p>
		</section>

		<ServiceStatusReports
			id="uptime-service-reports"
			heading={statusSite.copy.uptime.serviceJourneys}
			services={demoServices}
			variant="route"
		/>
	</div>
</main>

<style>
	.uptime-summary {
		padding: 28px 0 24px;
	}

	.uptime-summary__heading {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 18px;
	}

	.uptime-summary h2 {
		margin: 0;
		font-size: var(--status-text-title-md);
		font-weight: 500;
		letter-spacing: -0.025em;
		line-height: 1.25;
	}

	.uptime-summary__heading strong {
		color: var(--status-positive-strong);
		font-size: var(--status-text-title-sm);
		font-variant-numeric: tabular-nums;
		font-weight: 600;
		white-space: nowrap;
	}

	.uptime-scale {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 18px;
		padding-top: 12px;
		color: var(--status-ink-soft);
		font-size: var(--status-text-ui);
	}

	.uptime-verified {
		margin: 22px 0 0;
		padding-top: 15px;
		border-top: 1px solid var(--status-line-soft);
		color: var(--status-ink-faint);
		font-size: var(--status-text-caption);
		font-variant-numeric: tabular-nums;
		line-height: 1.4;
	}

	@media (max-width: 38.75rem) {
		.uptime-summary {
			padding-block: 22px;
		}

	}
</style>
