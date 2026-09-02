<script lang="ts">
	import { statusSite } from '$lib/config/site';
	import '../app.css';
	import StatusShell from '$lib/components/StatusShell.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" type="image/svg+xml" href={statusSite.logo} />
	<link rel="alternate icon" href={statusSite.logo} />
</svelte:head>

<StatusShell>
	{@render children()}
</StatusShell>
