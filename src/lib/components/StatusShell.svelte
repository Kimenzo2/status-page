<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import { statusSite } from '$lib/config/site';

	const tabs = [
		{ href: '/', label: 'Overview' },
		{ href: '/incidents', label: 'Incidents' },
		{ href: '/maintenance', label: 'Maintenance' },
		{ href: '/uptime', label: 'Uptime' }
	];

	let subscribed = $state(false);
	let pathname = $derived(page.url.pathname);
	let { children }: { children: Snippet } = $props();
</script>

<a class="skip-link" href="#main-content">Skip to content</a>

<header class="site-header">
	<div class="site-header__inner">
		<a class="site-brand" href="/" aria-label={`${statusSite.name} status overview`}>
			<img src={statusSite.logo} alt="" width="30" height="30" draggable="false" />
			<span>{statusSite.name}</span>
		</a>

		<nav class="status-tabs" aria-label="Status pages">
			{#each tabs as tab}
				<a class:active={pathname === tab.href} class="status-tab" href={tab.href} aria-current={pathname === tab.href ? 'page' : undefined}>
					{tab.label}
				</a>
			{/each}
		</nav>

		<button class:subscribed type="button" class="header-subscribe" aria-pressed={subscribed} onclick={() => (subscribed = !subscribed)}>
			{subscribed ? 'Unsubscribe' : 'Subscribe'}
		</button>
	</div>
</header>

<span class="sr-only" role="status" aria-live="polite">
	{#if subscribed}You are subscribed to {statusSite.name} status updates.{:else}You are not subscribed to {statusSite.name} status updates.{/if}
</span>

{@render children()}
