<script lang="ts">
	import { statusSite } from '$lib/config/site';
	import {
		incidentStatusLabels,
		incidentSymbols,
		type IncidentUpdate
	} from '$lib/data/incidents';

	let {
		updates,
		locale,
		id
	}: {
		updates: IncidentUpdate[];
		locale?: string;
		id?: string;
	} = $props();

	const copy = statusSite.copy.incidents;
	let showPrevious = $state(false);

	const dateFormatter = $derived(
		new Intl.DateTimeFormat(locale ?? statusSite.locale, {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: 'numeric',
			minute: '2-digit',
			timeZone: statusSite.timeZone,
			timeZoneName: 'short'
		})
	);

	const orderedUpdates = $derived(
		[...updates].sort((first, second) => Date.parse(second.publishedAt) - Date.parse(first.publishedAt))
	);
	const visibleUpdates = $derived(showPrevious ? orderedUpdates : orderedUpdates.slice(0, 1));
	const previousCount = $derived(Math.max(orderedUpdates.length - 1, 0));

	const previousUpdatesLabel = $derived(
		previousCount === 1
			? `1 ${copy.previousUpdate}`
			: `${previousCount} ${copy.previousUpdates}`
	);
</script>

{#if orderedUpdates.length}
	<ol id={id} class="incident-timeline">
		{#each visibleUpdates as update, index (update.id)}
			<li class:incident-timeline__item--latest={index === 0} class="incident-timeline__item">
				<span class="incident-timeline__marker" data-status={update.status} aria-hidden="true">{incidentSymbols[update.status]}</span>
				<div
					class="incident-update"
					aria-live={index === 0 ? 'polite' : undefined}
					aria-atomic={index === 0 ? 'true' : undefined}
				>
					<div class="incident-update__meta">
						<strong>{incidentStatusLabels[update.status]}</strong>
						<time datetime={update.publishedAt}>{dateFormatter.format(new Date(update.publishedAt))}</time>
					</div>
					<p>{update.message}</p>
				</div>
			</li>
		{/each}
	</ol>

	{#if previousCount}
		<div class="incident-timeline__toggle-row">
			<span class="incident-timeline__toggle-marker" aria-hidden="true"></span>
			<button
				class="incident-timeline__toggle"
				type="button"
				aria-expanded={showPrevious}
				aria-controls={id}
				onclick={() => (showPrevious = !showPrevious)}
			>
				{showPrevious ? copy.hidePreviousUpdates : previousUpdatesLabel}
			</button>
		</div>
	{/if}
{:else}
	<p class="incident-timeline__empty">{copy.noUpdates}</p>
{/if}

<style>
	.incident-timeline {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.incident-timeline__item {
		position: relative;
		display: grid;
		grid-template-columns: 24px minmax(0, 1fr);
		gap: 12px;
		padding-bottom: 14px;
	}

	.incident-timeline__item:not(:last-child)::before {
		position: absolute;
		inset-block: 25px 0;
		inset-inline-start: 11px;
		width: 1px;
		background: var(--status-line-soft);
		content: '';
	}

	.incident-timeline__marker,
	.incident-timeline__toggle-marker {
		position: relative;
		display: grid;
		width: 24px;
		height: 24px;
		place-items: center;
		border: 1px solid var(--status-positive-border);
		border-radius: 50%;
		background: var(--status-canvas);
		color: var(--status-positive-strong);
		font-size: var(--status-text-caption);
		font-weight: 600;
		line-height: 1;
	}

	.incident-timeline__marker[data-status='investigating'],
	.incident-timeline__marker[data-status='identified'] {
		border-color: var(--status-critical-border);
		color: var(--status-critical-strong);
	}

	.incident-timeline__marker[data-status='monitoring'] {
		border-color: var(--status-warning-border);
		color: var(--status-warning-strong);
	}

	.incident-update {
		min-width: 0;
		padding-top: 2px;
	}

	.incident-update__meta {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 4px 10px;
	}

	.incident-update__meta strong {
		color: var(--status-ink);
		font-size: var(--status-text-body-sm);
		font-weight: 600;
	}

	.incident-update__meta time {
		color: var(--status-ink-soft);
		font-size: var(--status-text-ui);
		font-variant-numeric: tabular-nums;
	}

	.incident-update p {
		max-width: 65ch;
		margin: 10px 0 0;
		color: var(--status-ink-soft);
		font-size: var(--status-text-body);
		line-height: 1.5;
		overflow-wrap: break-word;
		text-wrap: pretty;
	}

	.incident-timeline__empty {
		max-width: 65ch;
		margin: 10px 0 0;
		color: var(--status-ink-soft);
		font-size: var(--status-text-body-sm);
		line-height: 1.5;
		overflow-wrap: break-word;
		text-wrap: pretty;
	}

	.incident-timeline__toggle-row {
		display: grid;
		grid-template-columns: 24px minmax(0, 1fr);
		gap: 12px;
		align-items: center;
	}

	.incident-timeline__toggle-marker {
		width: 16px;
		height: 16px;
		margin-inline: 4px;
		border-color: var(--status-ink-faint);
		background: transparent;
		border-style: dotted;
	}

	.incident-timeline__toggle {
		justify-self: start;
		min-height: 44px;
		padding: 8px 10px;
		border: 1px solid var(--status-line-soft);
		border-radius: var(--status-radius-control);
		background: transparent;
		color: var(--status-ink-soft);
		cursor: pointer;
		font: inherit;
		font-size: var(--status-text-ui);
		text-align: start;
	}

	@media (hover: hover) {
		.incident-timeline__toggle:hover {
			border-color: var(--status-line);
			color: var(--status-ink);
		}
	}

	@media (max-width: 38.75rem) {
		.incident-timeline__item,
		.incident-timeline__toggle-row {
			grid-template-columns: 22px minmax(0, 1fr);
			gap: 10px;
		}

		.incident-timeline__marker {
			width: 22px;
			height: 22px;
		}

		.incident-timeline__item:not(:last-child)::before {
			inset-inline-start: 10px;
		}
	}
</style>
