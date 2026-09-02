<script lang="ts">
	import { statusSite } from '$lib/config/site';
	import { demoUptimeDays } from '$lib/data/uptime';
	import UptimeBars from '$lib/components/UptimeBars.svelte';

	const journeys = [
		{ name: 'Sign in', detail: 'Authentication and account access' },
		{ name: 'Dashboard', detail: 'Workspace loading and saved changes' },
		{ name: 'API requests', detail: 'API v1 and API v2' },
		{ name: 'File uploads', detail: 'Uploads and file processing' }
	];
</script>

<svelte:head>
	<title>Uptime | {statusSite.name} status</title>
	<meta name="description" content={`${statusSite.name} availability history for the last 90 days.`} />
</svelte:head>

<main id="main-content" class="route-page">
	<div class="route-container">
		<header class="route-header">
			<h1>Uptime</h1>
			<p>Availability across {statusSite.name} service journeys.</p>
		</header>

		<section class="route-block uptime-summary" aria-labelledby="uptime-summary-title">
			<div class="uptime-summary__heading">
				<h2 id="uptime-summary-title">{statusSite.name}</h2>
				<strong>100.00%</strong>
			</div>
			<UptimeBars days={demoUptimeDays} variant="route" ariaLabel={`90 days of operational availability for ${statusSite.name}`} />
			<div class="uptime-scale"><span>90 days ago</span><span>Today</span></div>
			<p class="uptime-verified">Last verified September 2, 2026 at 2:13 pm EAT</p>
		</section>

		<section class="route-section" aria-labelledby="journeys-title">
			<div class="route-section__heading">
				<h2 id="journeys-title">Service journeys</h2>
				<span>100.00% each</span>
			</div>
			<ul class="journeys-list">
				{#each journeys as journey}
					<li>
						<span class="journey-copy">
							<strong>{journey.name}</strong>
							<small>{journey.detail}</small>
						</span>
						<span class="journey-value"><span class="status-dot" aria-hidden="true"></span>100.00%</span>
					</li>
				{/each}
			</ul>
		</section>
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

	.journeys-list {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.journeys-list li {
		display: flex;
		min-height: 76px;
		align-items: center;
		justify-content: space-between;
		gap: 24px;
		padding: 16px 0;
		border-bottom: 1px solid var(--status-line-soft);
	}

	.journey-copy {
		display: grid;
		gap: 4px;
		min-width: 0;
	}

	.journey-copy strong {
		color: var(--status-ink);
		font-size: var(--status-text-body-sm);
		font-weight: 500;
	}

	.journey-copy small {
		color: var(--status-ink-soft);
		font-size: var(--status-text-ui);
		line-height: 1.4;
		text-wrap: pretty;
	}

	.journey-value {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		color: var(--status-positive-strong);
		font-size: var(--status-text-ui-lg);
		font-variant-numeric: tabular-nums;
		font-weight: 600;
		white-space: nowrap;
	}

	.status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--status-positive);
	}

	@media (max-width: 38.75rem) {
		.uptime-summary {
			padding-block: 22px;
		}

		.journeys-list li {
			gap: 12px;
		}

		.journey-value {
			font-size: var(--status-text-caption);
		}
	}
</style>
