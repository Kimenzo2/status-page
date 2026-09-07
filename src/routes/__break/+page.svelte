	<script lang="ts">
	import StatusShell from '$lib/components/StatusShell.svelte';
	import { statusSite } from '$lib/config/site';
	import { formatCopy } from '$lib/data/status';

	const diagnostics = statusSite.copy.diagnostics;
</script>

<svelte:head>
	<title>{diagnostics.title}</title>
	<meta name="description" content={diagnostics.metaDescription} />
</svelte:head>

<main class="break-report">
	<h1>{diagnostics.title}</h1>
	<p>{diagnostics.intro}</p>

	{#each diagnostics.scenarios as scenario}
		<section class="break-scenario" aria-labelledby={scenario.id}>
			<h2 id={scenario.id}>{scenario.name}</h2>
			<p>{scenario.description}</p>

			<div class={`scenario-container ${scenario.className}`}>
				<StatusShell siteName={statusSite.name}>
					<p>{formatCopy(diagnostics.fixture, { scenario: scenario.name.toLowerCase() })}</p>
				</StatusShell>
			</div>

			<p class="scenario-observation">{diagnostics.observation}</p>
		</section>
	{/each}
</main>

<style>
	.scenario-container {
		min-width: 0;
	}

	.scenario-container--320 {
		width: 320px;
		max-width: 100%;
	}

	.scenario-container--squeezed {
		display: grid;
		width: min(100%, 640px);
		grid-template-columns: minmax(0, 1fr) 24px;
	}

	.scenario-container--squeezed > :global(.site-header) {
		min-width: 0;
		grid-column: 1;
	}

	.scenario-container--wide {
		width: min(100%, 1440px);
	}

	.scenario-container--state {
		width: min(100%, 900px);
	}
</style>
