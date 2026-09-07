<script lang="ts">
	import IncidentHistory from '$lib/components/IncidentHistory.svelte';
	import { page } from '$app/state';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import { statusSite } from '$lib/config/site';
	import { demoIncidents, getActiveIncident, incidentStatusLabels } from '$lib/data/incidents';
	import {
		demoServices,
		formatCopy,
		getOverallStatus,
		statusLabels,
		statusSymbols
	} from '$lib/data/status';
	import { demoUptimeDays } from '$lib/data/uptime';

	const overallStatus = getOverallStatus(demoServices);
	const activeIncident = getActiveIncident(demoIncidents);
	const currentStatus = activeIncident ? (activeIncident.status === 'monitoring' ? 'degraded' : 'outage') : overallStatus;
	const currentTitle = activeIncident?.title ?? statusSite.copy.incidents.noActiveTitle;
	const currentSummary = activeIncident?.summary ?? statusSite.copy.incidents.operationalSummary;
	const currentLabel = activeIncident ? incidentStatusLabels[activeIncident.status] : statusLabels[overallStatus];
	let siteName = $derived(page.data.tenant?.record?.displayName ?? statusSite.name);
</script>


<svelte:head>
	<title>{formatCopy(statusSite.copy.pageTitle, { title: statusSite.copy.incidents.title, site: siteName })}</title>
	<meta name="description" content={formatCopy(statusSite.copy.incidents.metaDescription, { site: siteName })} />
</svelte:head>

<main id="main-content" class="route-page">
	<div class="route-container">
		<header class="route-header">
			<h1>{statusSite.copy.incidents.title}</h1>
			<p>{statusSite.copy.incidents.description}</p>
		</header>

		<section class="route-block" aria-labelledby="current-state-title">
			<div class="route-block__heading">
				<div class="route-state-mark" data-status={currentStatus} aria-hidden="true">
					{#if currentStatus === 'operational'}
						<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m6.5 12.5 3.5 3.5 7.5-8" /></svg>
					{:else}
						<span>{statusSymbols[currentStatus]}</span>
					{/if}
				</div>
				<div class="route-block__copy">
					<h2 id="current-state-title">{currentTitle}</h2>
					<p>{currentSummary}</p>
				</div>
				<strong class="route-block__label" data-status={currentStatus}>{currentLabel}</strong>
			</div>
		</section>

		<section class="route-section" aria-labelledby="history-title">
			<div class="route-section__heading incident-history-heading">
				<h2 id="history-title">{statusSite.copy.incidents.historyTitle}</h2>
				<span>{formatCopy(statusSite.copy.incidents.historyPeriod, { days: demoUptimeDays.length })}</span>
			</div>
			{#if demoIncidents.length}
				<IncidentHistory incidents={demoIncidents} locale={statusSite.locale} />
			{:else}
				<EmptyState state={statusSite.copy.emptyStates.incidentHistory} />
			{/if}
		</section>
	</div>
</main>

<style>
	.route-block__label[data-status='degraded'] {
		color: var(--status-warning-strong);
	}

	.route-block__label[data-status='outage'] {
		color: var(--status-critical-strong);
	}

	.route-block__label[data-status='unknown'] {
		color: var(--status-ink-soft);
	}

	.route-state-mark[data-status='degraded'] {
		border-color: var(--status-warning-border);
		background: var(--status-warning-surface);
		color: var(--status-warning-strong);
	}

	.route-state-mark[data-status='outage'] {
		border-color: var(--status-critical-border);
		background: var(--status-critical-surface);
		color: var(--status-critical-strong);
	}

	.route-state-mark[data-status='unknown'] {
		border-color: var(--status-line);
		background: var(--status-surface-muted);
		color: var(--status-ink-soft);
	}

	.route-state-mark > span {
		font-size: 1.25rem;
		font-weight: 600;
		line-height: 1;
	}

	.incident-history-heading {
		border-bottom: 0;
	}

</style>
