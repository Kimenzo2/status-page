<script lang="ts">
	import { getStatusThemeStyle, statusSite } from '$lib/config/site';
	import '../app.css';
	import StatusShell from '$lib/components/StatusShell.svelte';

	let { data, children } = $props();
	const themeStyle = getStatusThemeStyle();
	let siteName = $derived(data.tenant?.record?.displayName ?? statusSite.name);
</script>

<svelte:head>
	<link rel="icon" type="image/svg+xml" href={statusSite.logo} />
	<link rel="alternate icon" href={statusSite.logo} />
</svelte:head>

<div class="status-app" style={themeStyle}>
		<StatusShell {siteName}>
		{@render children()}
	</StatusShell>
</div>

<style>
	.status-app {
		min-height: 100dvh;
		background: var(--status-canvas);
		color: var(--status-ink);
		font-family: var(--status-font-sans);
		font-size: var(--status-text-body);
	}
</style>
