<script lang="ts">
	import { statusSite } from '$lib/config/site';
	import { incidentStatusLabels, type Incident } from '$lib/data/incidents';
	import { demoServices } from '$lib/data/status';
	import IncidentTimeline from '$lib/components/IncidentTimeline.svelte';

	type IncidentDay = {
		key: string;
		label: string;
		date: string;
		incidents: Incident[];
	};

	type IncidentMonth = {
		key: string;
		label: string;
		days: IncidentDay[];
	};

	let {
		incidents,
		locale
	}: {
		incidents: Incident[];
		locale?: string;
	} = $props();

	const copy = statusSite.copy.incidents;
	const dateLocale = $derived(locale ?? statusSite.locale);
	const monthFormatter = $derived(
		new Intl.DateTimeFormat(dateLocale, {
			month: 'long',
			year: 'numeric',
			timeZone: statusSite.timeZone
		})
	);
	const dayFormatter = $derived(
		new Intl.DateTimeFormat(dateLocale, {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			timeZone: statusSite.timeZone
		})
	);
	const monthKeyFormatter = $derived(
		new Intl.DateTimeFormat(dateLocale, {
			month: '2-digit',
			year: 'numeric',
			timeZone: statusSite.timeZone
		})
	);
	const dayKeyFormatter = $derived(
		new Intl.DateTimeFormat(dateLocale, {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			timeZone: statusSite.timeZone
		})
	);
	const serviceNames = new Map(demoServices.map((service) => [service.id, service.name]));

	const months = $derived.by(() => {
		const monthGroups = new Map<string, IncidentMonth>();
		const orderedIncidents = [...incidents].sort(
			(first, second) => Date.parse(second.startedAt) - Date.parse(first.startedAt)
		);

		for (const incident of orderedIncidents) {
			const date = new Date(incident.startedAt);
			const monthKey = monthKeyFormatter.format(date);
			const dayKey = dayKeyFormatter.format(date);
			let month = monthGroups.get(monthKey);

			if (!month) {
				month = {
					key: monthKey,
					label: monthFormatter.format(date),
					days: []
				};
				monthGroups.set(monthKey, month);
			}

			let day = month.days.find((group) => group.key === dayKey);
			if (!day) {
				day = {
					key: dayKey,
					label: dayFormatter.format(date),
					date: incident.startedAt,
					incidents: []
				};
				month.days.push(day);
			}

			day.incidents.push(incident);
		}

		return [...monthGroups.values()];
	});

	function countLabel(count: number) {
		return `${count} ${count === 1 ? copy.incident : copy.incidents}`;
	}

	function monthId(key: string) {
		return `incident-month-${key.replace(/[^a-z0-9]+/gi, '-')}`;
	}

	function serviceLabel(id: string) {
		return serviceNames.get(id) ?? id;
	}
</script>

<div class="incident-history">
	{#each months as month (month.key)}
		<section class="incident-month" aria-labelledby={monthId(month.key)}>
			<header class="incident-month__heading">
				<h3 id={monthId(month.key)}>{month.label}</h3>
			</header>

			{#each month.days as day (day.key)}
				<section class="incident-day" aria-labelledby={`incident-day-${day.key.replace(/[^a-z0-9]+/gi, '-')}`}>
					<h4 class="incident-day__heading" id={`incident-day-${day.key.replace(/[^a-z0-9]+/gi, '-')}`}>
						<time datetime={day.date}>{day.label}</time>
						<span>{countLabel(day.incidents.length)}</span>
					</h4>

					{#each day.incidents as incident (incident.id)}
						<article class="incident-entry">
							<div class="incident-entry__heading">
								<h5>{incident.title}</h5>
								<span class="incident-entry__status" data-status={incident.status}>{incidentStatusLabels[incident.status]}</span>
							</div>
							<p class="incident-entry__summary">{incident.summary}</p>
							<p class="incident-entry__services"><span>{copy.affectedServices}:</span> {incident.affectedServices.map(serviceLabel).join(', ')}</p>
							<IncidentTimeline
								updates={incident.updates}
								locale={locale}
								id={`incident-updates-${incident.id}`}
							/>
						</article>
					{/each}
				</section>
			{/each}
		</section>
	{/each}
</div>

<style>
	.incident-history {
		display: grid;
		gap: 28px;
	}

	.incident-month {
		overflow: hidden;
		border: 1px solid var(--status-line);
		border-radius: var(--status-radius-panel);
		background: transparent;
	}

	.incident-month__heading {
		padding: 24px;
		border-bottom: 1px solid var(--status-line-soft);
	}

	.incident-month__heading h3 {
		margin: 0;
		color: var(--status-ink);
		font-size: var(--status-text-title-sm);
		font-weight: 500;
		letter-spacing: -0.02em;
	}

	.incident-day + .incident-day {
		border-top: 1px solid var(--status-line-soft);
	}

	.incident-day__heading {
		margin: 0;
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 18px;
		padding: 15px 24px;
		background: var(--status-surface-muted);
		color: var(--status-ink-soft);
		font-size: var(--status-text-ui);
		font-variant-numeric: tabular-nums;
		font-weight: 400;
		line-height: 1.4;
		text-align: start;
	}

	.incident-day__heading time {
		min-width: 0;
		color: var(--status-ink-soft);
		overflow-wrap: break-word;
	}

	.incident-day__heading span {
		white-space: nowrap;
	}

	.incident-entry {
		padding: 26px 24px 28px;
	}

	.incident-entry + .incident-entry {
		border-top: 1px solid var(--status-line-soft);
	}

	.incident-entry__heading {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 18px;
	}

	.incident-entry__heading h5 {
		min-width: 0;
		margin: 0;
		color: var(--status-ink);
		font-size: var(--status-text-title-sm);
		font-weight: 500;
		letter-spacing: -0.02em;
		line-height: 1.25;
		overflow-wrap: break-word;
		text-wrap: balance;
	}

	.incident-entry__status {
		flex: 0 0 auto;
		padding: 4px 9px;
		border-radius: 999px;
		background: var(--status-positive-surface);
		color: var(--status-positive-strong);
		font-size: var(--status-text-caption);
		font-weight: 600;
		white-space: nowrap;
	}

	.incident-entry__status[data-status='investigating'],
	.incident-entry__status[data-status='identified'] {
		background: var(--status-critical-surface);
		color: var(--status-critical-strong);
	}

	.incident-entry__status[data-status='monitoring'] {
		background: var(--status-warning-surface);
		color: var(--status-warning-strong);
	}

	.incident-entry__summary,
	.incident-entry__services {
		max-width: 65ch;
		margin: 9px 0 0;
		color: var(--status-ink-soft);
		font-size: var(--status-text-body-sm);
		line-height: 1.5;
		text-wrap: pretty;
	}

	.incident-entry__services {
		margin-top: 6px;
		font-size: var(--status-text-ui);
	}

	.incident-entry__services span {
		color: var(--status-ink);
		font-weight: 500;
	}

	.incident-entry :global(.incident-timeline) {
		margin-top: 22px;
	}

	@media (max-width: 38.75rem) {
		.incident-month__heading,
		.incident-day__heading,
		.incident-entry {
			padding-inline: 16px;
		}

		.incident-entry__heading {
			align-items: flex-start;
			flex-direction: column;
			gap: 10px;
		}
	}
</style>
