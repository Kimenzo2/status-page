<script lang="ts">
	import { statusSite } from '$lib/config/site';
	import { demoUptimeDays } from '$lib/data/uptime';
	import UptimeBars from '$lib/components/UptimeBars.svelte';

	const services = [
		{ name: 'Sign in', detail: 'Authentication and account access' },
		{ name: 'Dashboard', detail: 'Workspace loading and saved changes' },
		{ name: 'API requests', detail: 'API v1 and API v2' },
		{ name: 'File uploads', detail: 'Uploads and file processing' }
	];

	let maintenanceVisible = $state(true);
	let servicesOpen = $state(true);
</script>

<svelte:head>
	<title>Overview | {statusSite.name} status</title>
	<meta name="description" content={`Current service health and availability for ${statusSite.name}.`} />
</svelte:head>

<main id="main-content" class="overview-page">
	<div class="overview-container">
		{#if maintenanceVisible}
			<div class="maintenance-banner" role="status">
				<a class="maintenance-banner__link" href="/maintenance">
					<span class="maintenance-banner__icon" aria-hidden="true">
						<svg viewBox="0 0 24 24"><path d="m14.7 6.3 3-3a4.2 4.2 0 0 0-5.3 5.3l-6.8 6.8a2.1 2.1 0 1 0 3 3l6.8-6.8a4.2 4.2 0 0 0 5.3-5.3l-3 3-3-3Z" /></svg>
					</span>
					<span><strong>Scheduled maintenance</strong> · September 3, 2026 at 3:00 am EAT</span>
					<span class="maintenance-banner__arrow" aria-hidden="true">↗</span>
				</a>
				<button class="maintenance-banner__close" type="button" aria-label="Dismiss scheduled maintenance notice" onclick={() => (maintenanceVisible = false)}>
					<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17" /></svg>
				</button>
			</div>
		{/if}

		<section class:compact={!maintenanceVisible} class="status-hero" aria-labelledby="overview-title">
			<div class="overall-status-icon" aria-hidden="true">
				<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="18" /><path d="m15.5 24.2 5.8 5.7 11.5-12" /></svg>
			</div>
			<p class="hero-kicker">{statusSite.name} service status</p>
			<h1 id="overview-title">All services are online</h1>
		<p class="hero-meta">Last verified September 2, 2026 at 2:13 pm EAT</p>
		</section>

		<section class="service-group" aria-labelledby="services-title">
			<button class="service-group__header" type="button" aria-expanded={servicesOpen} aria-controls="service-group-details" onclick={() => (servicesOpen = !servicesOpen)}>
				<span class="service-group__name" id="services-title">{statusSite.name}</span>
				<span class="service-group__status"><span class="status-check" aria-hidden="true">✓</span> Operational <span class:rotated={servicesOpen} class="chevron" aria-hidden="true"></span></span>
			</button>

			{#if servicesOpen}
				<div id="service-group-details" class="service-group__body">
					<div class="uptime-heading">
						<div class="uptime-label"><span class="status-check" aria-hidden="true">✓</span><strong>{statusSite.name}</strong></div>
						<strong>100% uptime</strong>
					</div>
					<UptimeBars days={demoUptimeDays} variant="overview" ariaLabel={`90 days of operational uptime for ${statusSite.name}`} />
					<div class="uptime-scale"><span>90 days ago</span><span>Today</span></div>

					<div class="service-list">
						{#each services as service}
							<details class="service-row">
								<summary>
									<span>{service.name}</span>
								<span class="service-row__status"><span class="status-check" aria-hidden="true">✓</span> Operational <span class="row-chevron" aria-hidden="true"></span></span>
								</summary>
								<p>{service.detail}. No active incidents reported.</p>
							</details>
						{/each}
					</div>
				</div>
			{/if}
		</section>

	</div>
</main>

<style>
	.overview-page {
		min-height: calc(100dvh - 72px);
		padding: 18px 24px 90px;
		background: var(--status-canvas);
	}

	.overview-container {
		width: min(100%, var(--status-content-width));
		margin-inline: auto;
	}

	.maintenance-banner {
		position: relative;
		display: block;
		min-height: 54px;
		padding: 7px 58px 7px 18px;
		border-radius: var(--status-radius-surface);
		border: 1px solid var(--status-line-soft);
		background: transparent;
		color: var(--status-ink-soft);
		font-size: var(--status-text-ui-lg);
		line-height: 1.4;
		overflow-wrap: break-word;
	}

	.maintenance-banner__link {
		display: flex;
		min-height: 38px;
		align-items: center;
		justify-content: center;
		gap: 10px;
		color: inherit;
		text-decoration: none;
	}

	.maintenance-banner__link > span:nth-child(2) {
		text-align: center;
	}

	.maintenance-banner strong {
		color: var(--status-ink);
		font-weight: 500;
	}

	.maintenance-banner__icon {
		display: inline-flex;
		flex: 0 0 auto;
		color: var(--status-maintenance);
	}

	.maintenance-banner__icon svg {
		width: 19px;
		height: 19px;
		fill: none;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 1.7;
	}

	.maintenance-banner__arrow {
		margin-inline-start: 4px;
		font-size: 16px;
	}

	.maintenance-banner__close {
		position: absolute;
		top: 50%;
		inset-inline-end: 10px;
		display: grid;
		width: 36px;
		height: 36px;
		place-items: center;
		padding: 0;
		border: 1px solid var(--status-line);
		border-radius: 50%;
		background: var(--status-surface);
		color: var(--status-ink-soft);
		cursor: pointer;
		box-shadow: 0 1px 2px color-mix(in oklab, var(--mono-black) 24%, transparent);
		transform: translateY(-50%);
	}

	.maintenance-banner__close svg {
		width: 17px;
		height: 17px;
		fill: none;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-width: 1.7;
	}

	.status-hero {
		padding: 88px 12px 72px;
		text-align: center;
	}

	.status-hero.compact {
		padding-top: 32px;
	}

	.overall-status-icon {
		width: 58px;
		height: 58px;
		margin: 0 auto 22px;
		color: var(--status-positive);
	}

	.overall-status-icon svg {
		width: 100%;
		height: 100%;
		fill: none;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 2.2;
	}

	.hero-kicker {
		margin: 0;
		color: var(--status-ink-soft);
		font-size: var(--status-text-caption);
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.status-hero h1 {
		margin: 15px 0 0;
		color: var(--status-ink);
		font-size: var(--status-text-display);
		font-weight: 600;
		letter-spacing: -0.032em;
		line-height: 1.05;
		text-wrap: balance;
	}

	.hero-meta {
		margin: 18px 0 0;
		max-width: 60ch;
		margin-inline: auto;
		color: var(--status-ink-soft);
		font-size: var(--status-text-body-sm);
		font-variant-numeric: tabular-nums;
		line-height: 1.5;
		overflow-wrap: break-word;
		text-wrap: pretty;
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

	.service-row p {
		margin: 0;
		max-width: 60ch;
		padding: 0 24px 18px;
		color: var(--status-ink-soft);
		font-size: var(--status-text-ui);
		line-height: 1.5;
		overflow-wrap: break-word;
		text-wrap: pretty;
	}

	@media (max-width: 38.75rem) {
		.overview-page {
			padding: 12px 16px 58px;
		}

		.maintenance-banner {
			padding-inline-start: 14px;
			font-size: 12px;
		}

		.maintenance-banner__link {
			justify-content: flex-start;
			padding-inline-end: 6px;
		}

		.maintenance-banner__link > span:nth-child(2) {
			text-align: start;
		}

		.maintenance-banner__arrow {
			margin-inline-start: 2px;
		}

		.status-hero {
			padding: 62px 4px 52px;
		}

		.status-hero.compact {
			padding-top: 24px;
		}

		.status-hero h1 {
			font-size: var(--status-text-display-mobile);
		}

		.hero-meta {
			font-size: var(--status-text-ui);
			line-height: 1.5;
		}

		.service-group__header {
			min-height: 68px;
			padding-inline: 18px;
		}

		.service-group__body {
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

	}

	@media (hover: hover) {
		.maintenance-banner:hover {
			background: var(--status-surface-hover);
		}

		.maintenance-banner__close:hover {
			border-color: var(--status-ink-faint);
			background: var(--status-surface-hover);
			color: var(--status-ink);
		}

	}

	@media (prefers-reduced-motion: no-preference) {
		.chevron,
		.row-chevron {
			transition: transform 150ms ease-out;
		}

		.maintenance-banner__close {
			transition-property: transform, color, background-color, border-color, box-shadow;
			transition-duration: 150ms;
			transition-timing-function: ease-out;
		}

		.maintenance-banner__close:active {
			transform: translateY(-50%) scale(0.96);
		}
	}
</style>
