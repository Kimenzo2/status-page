<script lang="ts">
	import StatusShell from '$lib/components/StatusShell.svelte';

	const scenarios = [
		{
			name: '320px container',
			description: 'The narrowest supported container; tab through every control and inspect wrapping.',
			className: 'scenario-container--320'
		},
		{
			name: 'Squeezed flex sibling',
			description: 'The shell must shrink inside a constrained grid track without forcing horizontal overflow.',
			className: 'scenario-container--squeezed'
		},
		{
			name: 'Very wide container',
			description: 'A wide host checks that the shell keeps its intended measure instead of stretching to the edges.',
			className: 'scenario-container--wide'
		},
		{
			name: 'Subscription state',
			description: 'Initial state is unsubscribed. Activate Subscribe to exercise the reachable subscribed state.',
			className: 'scenario-container--state'
		}
	];
</script>

<svelte:head>
	<title>StatusShell break report</title>
	<meta name="description" content="Temporary stress-test scenarios for the shared status shell." />
</svelte:head>

<main class="break-report">
	<h1>StatusShell break report</h1>
	<p>
		This temporary page renders the production shell in every applicable scenario. The shell is unchanged; only
		labels, container widths, and fixture content were added.
	</p>

	{#each scenarios as scenario}
		<section class="break-scenario" aria-labelledby={scenario.name}>
			<h2 id={scenario.name}>{scenario.name}</h2>
			<p>{scenario.description}</p>

			<div class={`scenario-container ${scenario.className}`}>
				<StatusShell>
					<p>Fixture content for the {scenario.name.toLowerCase()} scenario.</p>
				</StatusShell>
			</div>

			<p class="scenario-observation">Observation pending: inspect this scenario in the browser.</p>
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
