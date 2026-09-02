<script lang="ts">
	import { statusSite } from '$lib/config/site';
</script>

<svelte:head>
	<title>Incidents | {statusSite.name} status</title>
	<meta name="description" content={`Current and recent incidents for ${statusSite.name}.`} />
</svelte:head>

<main id="main-content" class="route-page">
	<div class="route-container">
		<header class="route-header">
			<h1>Incidents</h1>
			<p>Current and past service events.</p>
		</header>

		<section class="route-block" aria-labelledby="current-state-title">
			<div class="route-block__heading">
				<div class="route-state-mark" aria-hidden="true">
					<svg viewBox="0 0 24 24"><path d="m6.5 12.5 3.5 3.5 7.5-8" /></svg>
				</div>
				<div class="route-block__copy">
					<h2 id="current-state-title">No active incidents</h2>
					<p>All services are operating normally.</p>
				</div>
				<strong class="route-block__label">Operational</strong>
			</div>
		</section>

		<section class="route-section" aria-labelledby="history-title">
			<div class="route-section__heading">
				<h2 id="history-title">History</h2>
				<span>Last 90 days</span>
			</div>
			<div class="route-empty">
				<p>No incidents reported.</p>
				<a href="/uptime">View uptime</a>
			</div>
		</section>
	</div>
</main>
