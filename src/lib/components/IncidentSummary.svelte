<script lang="ts">
	import { statusSite } from '$lib/config/site';
	import {
		incidentStatusLabels,
		type Incident
	} from '$lib/data/incidents';
	import { demoServices } from '$lib/data/status';

	let { incident }: { incident: Incident } = $props();

	const copy = statusSite.copy.incidents;
	const serviceNames = new Map(demoServices.map((service) => [service.id, service.name]));
	const orderedUpdates = $derived(
		[...incident.updates].sort((first, second) => Date.parse(second.publishedAt) - Date.parse(first.publishedAt))
	);
	const latestUpdate = $derived(orderedUpdates[0]);
	const dateFormatter = $derived(
		new Intl.DateTimeFormat(statusSite.locale, {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: 'numeric',
			minute: '2-digit',
			timeZone: statusSite.timeZone,
			timeZoneName: 'short'
		})
	);
</script>

<section class="incident-summary" aria-labelledby="overview-incident-title">
	<p class="incident-summary__eyebrow">{copy.overviewLabel}</p>
	<h2 id="overview-incident-title">{incident.title}</h2>
	<p class="incident-summary__summary">{incident.summary}</p>
	<p class="incident-summary__services"><span>{copy.affectedServices}:</span> {incident.affectedServices.map((id) => serviceNames.get(id) ?? id).join(', ')}</p>
	<p class="sr-only" role="status" aria-live="polite" aria-atomic="true">
		{#if latestUpdate}
			{incidentStatusLabels[latestUpdate.status]}. {dateFormatter.format(new Date(latestUpdate.publishedAt))}. {latestUpdate.message}
		{/if}
	</p>

	{#if orderedUpdates.length}
		<ol class="incident-summary__updates">
			{#each orderedUpdates as update (update.id)}
				<li>
					<div class="incident-summary__update-meta">
						<strong>{incidentStatusLabels[update.status]}</strong>
						<time datetime={update.publishedAt}>{dateFormatter.format(new Date(update.publishedAt))}</time>
					</div>
					<p>{update.message}</p>
				</li>
			{/each}
		</ol>
	{/if}

	<a class="incident-summary__link" href={copy.historyHref}>
		{copy.viewHistory}
		<span aria-hidden="true">↗</span>
	</a>
</section>

<style>
	.incident-summary {
		max-width: 68ch;
		margin: 0 26px 44px;
		padding: 0;
	}

	.incident-summary__eyebrow {
		margin: 0;
		color: var(--status-ink);
		font-size: var(--status-text-caption);
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.incident-summary h2 {
		margin: 12px 0 0;
		color: var(--status-ink);
		font-size: var(--status-text-title-md);
		font-weight: 500;
		letter-spacing: -0.025em;
		line-height: 1.2;
		overflow-wrap: break-word;
		text-wrap: balance;
	}

	.incident-summary__summary,
	.incident-summary__services,
	.incident-summary__updates p {
		max-width: 62ch;
		margin: 8px 0 0;
		color: var(--status-ink-soft);
		font-size: var(--status-text-body-sm);
		line-height: 1.5;
		overflow-wrap: break-word;
	}

	.incident-summary__summary {
		text-wrap: pretty;
	}

	.incident-summary__services {
		margin-top: 6px;
		font-size: var(--status-text-ui);
	}

	.incident-summary__services span {
		color: var(--status-ink);
		font-weight: 500;
	}

	.incident-summary__updates {
		max-width: 68ch;
		margin: 28px 0 0;
		padding: 0;
		list-style: none;
	}

	.incident-summary__updates li {
		padding: 0 0 20px;
	}

	.incident-summary__updates li + li {
		padding-top: 20px;
		border-top: 1px solid var(--status-line-soft);
	}

	.incident-summary__update-meta {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 4px 10px;
	}

	.incident-summary__update-meta strong {
		color: var(--status-ink);
		font-size: var(--status-text-body-sm);
		font-weight: 600;
	}

	.incident-summary__update-meta time {
		color: var(--status-ink-soft);
		font-size: var(--status-text-ui);
		font-variant-numeric: tabular-nums;
	}

	.incident-summary__link {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		margin-top: 16px;
		color: var(--status-ink);
		font-size: var(--status-text-ui);
		font-weight: 600;
	}

	.incident-summary__link span {
		font-size: 1rem;
		line-height: 1;
	}

	@media (max-width: 38.75rem) {
		.incident-summary {
			margin-inline: 18px;
		}
	}
</style>
