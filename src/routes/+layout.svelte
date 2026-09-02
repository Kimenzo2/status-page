<script lang="ts">
	import logo from '$lib/assets/productclient-logo.svg';
	import '../app.css';
	import StatusShell from '$lib/components/StatusShell.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" type="image/svg+xml" href={logo} />
	<link rel="alternate icon" href={logo} />
</svelte:head>

<StatusShell>
	{@render children()}
</StatusShell>
