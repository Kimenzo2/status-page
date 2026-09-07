<script lang="ts">
	import { page } from '$app/state';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import { statusSite } from '$lib/config/site';
	import {
		defaultMaintenanceEvent,
		demoMaintenanceEvents,
		maintenanceStatusLabels
	} from '$lib/data/maintenance';
	import { formatCopy } from '$lib/data/status';

	const dateFormatter = new Intl.DateTimeFormat(statusSite.locale, {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		timeZone: statusSite.timeZone
	});

	const timeFormatter = new Intl.DateTimeFormat(statusSite.locale, {
		hour: 'numeric',
		minute: '2-digit',
		timeZone: statusSite.timeZone,
		timeZoneName: 'short'
	});

	const selectedEvent = $derived(
		demoMaintenanceEvents.find((event) => event.id === page.url.searchParams.get('event')) ?? defaultMaintenanceEvent
	);
	const serviceNames = new Map(statusSite.serviceJourneys.map((service) => [service.id, service.name]));
	let siteName = $derived(page.data.tenant?.record?.displayName ?? statusSite.name);

	function formatAffectedServices(serviceIds: string[]) {
		return serviceIds
			.map((serviceId) => serviceId === '*' ? statusSite.copy.maintenance.allServices : serviceNames.get(serviceId) ?? serviceId)
			.join(', ');
	}
</script>


<svelte:head>
	<title>{formatCopy(statusSite.copy.pageTitle, { title: statusSite.copy.maintenance.title, site: siteName })}</title>
	<meta name="description" content={formatCopy(statusSite.copy.maintenance.metaDescription, { site: siteName })} />
</svelte:head>

<main id="main-content" class="route-page">
	<div class="route-container">
		<header class="route-header">
			<h1>{statusSite.copy.maintenance.title}</h1>
			<p>{formatCopy(statusSite.copy.maintenance.description, { site: siteName })}</p>
		</header>

		{#if selectedEvent}
		<section class="route-block maintenance-event" aria-labelledby="maintenance-event-title">
			<div class="maintenance-event__heading">
				<div class="maintenance-event__date">
					<time datetime={selectedEvent.start}>{dateFormatter.format(new Date(selectedEvent.start))}</time>
					<span>{timeFormatter.format(new Date(selectedEvent.start))}</span>
				</div>
				<span class="maintenance-event__status">{maintenanceStatusLabels[selectedEvent.status]}</span>
			</div>

			<div class="maintenance-event__body">
				<div class="maintenance-icon" aria-hidden="true">
					<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /></svg>
				</div>
				<div>
					<h2 id="maintenance-event-title">{selectedEvent.title}</h2>
					<p>{selectedEvent.summary}</p>
					<p class="maintenance-event__services">{statusSite.copy.maintenance.affectedServices}: {formatAffectedServices(selectedEvent.affectedServices)}</p>
				</div>
			</div>
		</section>
		{:else}
			<section class="maintenance-event maintenance-event--empty">
				<EmptyState state={statusSite.copy.emptyStates.maintenance} />
			</section>
		{/if}

		<p class="route-note">
			<span class="route-note__mark" aria-hidden="true">i</span>
			<span>{statusSite.copy.maintenance.updateNote}</span>
		</p>
	</div>
</main>

<style>
	.maintenance-event__heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20px;
		padding: 24px 0;
		border-bottom: 1px solid var(--status-line-soft);
	}

	.maintenance-event__date {
		display: grid;
		gap: 4px;
	}

	.maintenance-event__date time {
		color: var(--status-ink);
		font-size: var(--status-text-title-sm);
		font-weight: 500;
		letter-spacing: -0.02em;
	}

	.maintenance-event__date span {
		color: var(--status-ink-soft);
		font-size: var(--status-text-ui);
		font-variant-numeric: tabular-nums;
	}

	.maintenance-event__status {
		color: var(--status-maintenance-strong);
		font-size: var(--status-text-ui-lg);
		font-weight: 600;
		white-space: nowrap;
	}

	.maintenance-event__body {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		gap: 16px;
		padding: 28px 0;
	}

	.maintenance-icon {
		display: grid;
		width: 42px;
		height: 42px;
		place-items: center;
		border: 1px solid var(--status-maintenance-border);
		border-radius: 50%;
		background: var(--status-maintenance-surface);
		color: var(--status-maintenance-strong);
	}

	.maintenance-icon svg {
		width: 21px;
		height: 21px;
		fill: none;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 1.7;
	}

	.maintenance-event h2 {
		margin: 0;
		font-size: var(--status-text-title-md);
		font-weight: 500;
		letter-spacing: -0.025em;
		line-height: 1.25;
	}

	.maintenance-event p {
		max-width: 55ch;
		margin: 8px 0 0;
		color: var(--status-ink-soft);
		font-size: var(--status-text-body-sm);
		line-height: 1.5;
		text-wrap: pretty;
	}

	@media (max-width: 38.75rem) {
		.maintenance-event__heading {
			align-items: flex-start;
		}

		.maintenance-event__body {
			padding-block: 22px;
		}
	}
</style>
