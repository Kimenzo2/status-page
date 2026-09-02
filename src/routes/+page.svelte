<script lang="ts">
	import StatusSelect from '$lib/components/StatusSelect.svelte';

	type Impact = {
		label: string;
		detail: string;
		kind: 'clear' | 'watch';
	};

	const regions = ['Global', 'Europe', 'East Africa', 'North America', 'Asia Pacific'];
	const workflows = ['Sign in', 'Dashboard', 'API requests', 'File uploads'];
	const regionImpact: Record<string, Impact> = {
		Global: { label: 'No reported issues', detail: 'No reported issues for ProductClient in this context. Current signals show the service operating normally.', kind: 'clear' },
		Europe: { label: 'No reported issues', detail: 'No reported issues for ProductClient in Europe. Current signals show the service operating normally.', kind: 'clear' },
		'East Africa': { label: 'No reported issues', detail: 'No reported issues for ProductClient in East Africa. Current signals show the service operating normally.', kind: 'clear' },
		'North America': { label: 'No reported issues', detail: 'No reported issues for ProductClient in North America. Current signals show the service operating normally.', kind: 'clear' },
		'Asia Pacific': { label: 'No reported issues', detail: 'No reported issues for ProductClient in Asia Pacific. Current signals show the service operating normally.', kind: 'clear' }
	};

	const services = [
		{ name: 'Sign in', detail: 'Authentication and account access' },
		{ name: 'Dashboard', detail: 'Workspace loading and saved changes' },
		{ name: 'API requests', detail: 'API v1 and API v2' },
		{ name: 'File uploads', detail: 'Uploads and file processing' }
	];

	const uptimeDays = Array.from({ length: 90 }, (_, index) => index);

	let servicesOpen = $state(true);
	let region = $state('Global');
	let workflow = $state('Sign in');
	let selectedImpact = $derived(workflow === 'Sign in' ? regionImpact[region] : regionImpact.Global);
</script>

<svelte:head>
	<title>Overview | ProductClient status</title>
	<meta name="description" content="Current service health and availability for ProductClient." />
</svelte:head>

<main id="main-content" class="overview-page">
	<div class="overview-container">
		<a class="maintenance-banner" href="/maintenance">
			<span class="maintenance-banner__icon" aria-hidden="true">
				<svg viewBox="0 0 24 24"><path d="m14.7 6.3 3-3a4.2 4.2 0 0 0-5.3 5.3l-6.8 6.8a2.1 2.1 0 1 0 3 3l6.8-6.8a4.2 4.2 0 0 0 5.3-5.3l-3 3-3-3Z" /></svg>
			</span>
			<span><strong>Scheduled maintenance</strong> · September 3, 2026 at 3:00 am EAT</span>
			<span class="maintenance-banner__arrow" aria-hidden="true">↗</span>
		</a>

		<section class="status-hero" aria-labelledby="overview-title">
			<div class="overall-status-icon" aria-hidden="true">
				<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="18" /><path d="m15.5 24.2 5.8 5.7 11.5-12" /></svg>
			</div>
			<p class="hero-kicker">ProductClient service status</p>
			<h1 id="overview-title">All services are online</h1>
		<p class="hero-meta">Last verified September 2, 2026 at 2:13 pm EAT</p>
		</section>

		<section class="service-group" aria-labelledby="services-title">
			<button class="service-group__header" type="button" aria-expanded={servicesOpen} aria-controls="service-group-details" onclick={() => (servicesOpen = !servicesOpen)}>
				<span class="service-group__name" id="services-title">ProductClient</span>
				<span class="service-group__status"><span class="status-check" aria-hidden="true">✓</span> Operational <span class:rotated={servicesOpen} class="chevron" aria-hidden="true"></span></span>
			</button>

			{#if servicesOpen}
				<div id="service-group-details" class="service-group__body">
					<div class="uptime-heading">
						<div class="uptime-label"><span class="status-check" aria-hidden="true">✓</span><strong>ProductClient</strong></div>
						<strong>100% uptime</strong>
					</div>
					<div class="uptime-bars" role="img" aria-label="90 days of operational uptime">
						{#each uptimeDays as day}
							<span title={`Day ${day + 1}: operational`}></span>
						{/each}
					</div>
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

		<section class="impact-section" aria-labelledby="impact-title">
			<div class="impact-section__heading">
				<div>
					<p class="section-kicker">Customer view</p>
					<h2 id="impact-title">Check your context</h2>
				</div>
				<p>Service health is shared, but impact can vary by region and workflow.</p>
			</div>
			<div class="impact-controls">
				<StatusSelect id="region" label="Region" options={regions} value={region} onValueChange={(next) => (region = next)} />
				<StatusSelect id="workflow" label="Workflow" options={workflows} value={workflow} onValueChange={(next) => (workflow = next)} />
			</div>
			<div class:watch={selectedImpact.kind === 'watch'} class="impact-result" role="status" aria-live="polite">
				<span class="impact-result__mark" aria-hidden="true">{selectedImpact.kind === 'clear' ? '✓' : '!'}</span>
				<div><strong>{selectedImpact.label}</strong><p>{selectedImpact.detail}</p></div>
			</div>
			<p class="impact-note">This estimate uses current signals and may not reflect your account.</p>
		</section>

		<section class="overview-links" aria-label="More status information">
			<a href="/incidents"><span><strong>Incident history</strong><small>See what happened and when</small></span><b aria-hidden="true">→</b></a>
			<a href="/uptime"><span><strong>Availability history</strong><small>Review service reliability by journey</small></span><b aria-hidden="true">→</b></a>
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
		width: min(100%, 900px);
		margin-inline: auto;
	}

	.maintenance-banner {
		display: flex;
		min-height: 54px;
		align-items: center;
		justify-content: center;
		gap: 10px;
		padding: 10px 18px;
		border-radius: var(--status-radius-surface);
		border: 1px solid var(--status-line-soft);
		background: transparent;
		color: var(--status-ink-soft);
		font-size: var(--status-text-ui-lg);
		line-height: 1.4;
		overflow-wrap: break-word;
		text-decoration: none;
	}

	.maintenance-banner strong {
		color: var(--status-ink);
		font-weight: 650;
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

	.status-hero {
		padding: 88px 12px 72px;
		text-align: center;
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

	.hero-kicker,
	.section-kicker {
		margin: 0;
		color: var(--status-ink-soft);
		font-size: var(--status-text-caption);
		font-weight: 750;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.status-hero h1 {
		margin: 15px 0 0;
		color: var(--status-ink);
		font-size: var(--status-text-display);
		font-weight: 700;
		letter-spacing: -0.065em;
		line-height: 1.02;
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
		font-weight: 650;
		letter-spacing: -0.02em;
	}

	.service-group__status,
	.service-row__status {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		color: var(--status-ink);
		font-size: var(--status-text-ui-lg);
		font-weight: 500;
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
		font-weight: 800;
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
	.service-row summary,
	.impact-section__heading,
	.overview-links a {
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

	.uptime-bars {
		display: grid;
		grid-template-columns: repeat(90, minmax(0, 1fr));
		gap: 2px;
		height: 48px;
		align-items: stretch;
	}

	.uptime-bars span {
		min-width: 2px;
		border-radius: 2px;
		background: var(--status-positive);
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

	.impact-section {
		padding: 70px 0 0;
	}

	.impact-section__heading {
		align-items: end;
		margin-bottom: 24px;
	}

	.impact-section h2 {
		margin: 10px 0 0;
		font-size: var(--status-text-title-md);
		letter-spacing: -0.05em;
		line-height: 1.1;
		text-wrap: balance;
	}

	.impact-section__heading > p {
		max-width: 31ch;
		margin: 0;
		color: var(--status-ink-soft);
		font-size: var(--status-text-ui);
		line-height: 1.5;
		overflow-wrap: break-word;
		text-align: end;
		text-wrap: pretty;
	}

	.impact-controls {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 12px;
	}

	.impact-result {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		margin-top: 14px;
		padding: 15px 16px;
		border: 1px solid var(--status-positive-border);
		border-radius: var(--status-radius-row);
		background: transparent;
	}

	.impact-result.watch {
		border-color: var(--status-warning-border);
		background: transparent;
	}

	.impact-result__mark {
		display: inline-grid;
		flex: 0 0 auto;
		width: 20px;
		height: 20px;
		place-items: center;
		border: 1px solid var(--status-positive-mark);
		border-radius: 50%;
		color: var(--status-positive-strong);
		font-size: 12px;
		font-weight: 800;
	}

	.impact-result.watch .impact-result__mark {
		border-color: var(--status-warning-mark);
		color: var(--status-warning);
	}

	.impact-result strong {
		font-size: var(--status-text-ui);
		font-weight: 700;
	}

	.impact-result p {
		margin: 3px 0 0;
		color: var(--status-ink-soft);
		font-size: var(--status-text-caption);
		line-height: 1.5;
		overflow-wrap: break-word;
		text-wrap: pretty;
	}

	.impact-note {
		margin: 10px 0 0;
		color: var(--status-ink-faint);
		font-size: var(--status-text-caption);
		line-height: 1.5;
		max-width: 60ch;
		overflow-wrap: break-word;
		text-wrap: pretty;
	}

	.overview-links {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 12px;
		padding-top: 58px;
	}

	.overview-links a {
		min-height: 72px;
		padding: 0 18px;
		border-top: 1px solid var(--status-line);
		color: var(--status-ink);
		text-decoration: none;
	}

	.overview-links span {
		display: grid;
		gap: 4px;
	}

	.overview-links strong {
		font-size: var(--status-text-ui);
		font-weight: 700;
	}

	.overview-links small {
		color: var(--status-ink-faint);
		font-size: var(--status-text-caption);
	}

	.overview-links b {
		font-size: 17px;
		font-weight: 400;
	}

	@media (max-width: 38.75rem) {
		.overview-page {
			padding: 12px 16px 58px;
		}

		.maintenance-banner {
			justify-content: flex-start;
			font-size: 12px;
		}

		.maintenance-banner__arrow {
			margin-inline-start: auto;
		}

		.status-hero {
			padding: 62px 4px 52px;
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

		.uptime-bars {
			grid-template-columns: repeat(45, minmax(0, 1fr));
			grid-auto-flow: row;
			height: 62px;
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

		.impact-section {
			padding-top: 54px;
		}

		.impact-section__heading {
			display: block;
		}

		.impact-section__heading > p {
			max-width: 35ch;
			margin-top: 11px;
			text-align: start;
		}

		.impact-controls,
		.overview-links {
			grid-template-columns: 1fr;
		}

		.overview-links {
			gap: 0;
			padding-top: 42px;
		}
	}

	@media (hover: hover) {
		.maintenance-banner:hover {
			background: var(--status-surface-hover);
		}

		.uptime-bars span:hover {
			background: var(--status-positive-strong);
		}

		.overview-links a:hover {
			border-top-color: var(--status-ink-soft);
			color: var(--status-ink);
		}
	}

	@media (prefers-reduced-motion: no-preference) {
		.chevron,
		.row-chevron {
			transition: transform 150ms ease-out;
		}
	}
</style>
