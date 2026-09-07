<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import { statusSite } from '$lib/config/site';
	import { formatCopy } from '$lib/data/status';

	const tabs = statusSite.navigation;

	let subscribed = $state(false);
	let pathname = $derived(page.url.pathname);
	let { children, siteName }: { children: Snippet; siteName: string } = $props();
</script>

<a class="skip-link" href="#main-content">{statusSite.copy.accessibility.skipToContent}</a>

<header class="site-header">
	<div class="site-header__inner">
		<a class="site-brand" href="/" aria-label={formatCopy(statusSite.copy.accessibility.brandLabel, { site: siteName })}>
			<img src={statusSite.logo} alt="" width="30" height="30" draggable="false" />
			<span>{siteName}</span>
		</a>

		<nav class="status-tabs" aria-label={statusSite.copy.navigationAriaLabel}>
			{#each tabs as tab}
				<a class:active={pathname === tab.href} class="status-tab" href={tab.href} aria-current={pathname === tab.href ? 'page' : undefined}>
					{tab.label}
				</a>
			{/each}
		</nav>

		<button class:subscribed type="button" class="header-subscribe" aria-pressed={subscribed} onclick={() => (subscribed = !subscribed)}>
			{subscribed ? statusSite.copy.unsubscribe : statusSite.copy.subscribe}
		</button>
	</div>
</header>

<span class="sr-only" role="status" aria-live="polite">
	{#if subscribed}
		{formatCopy(statusSite.copy.subscriptionAnnouncement.subscribed, { site: siteName })}
	{:else}
		{formatCopy(statusSite.copy.subscriptionAnnouncement.unsubscribed, { site: siteName })}
	{/if}
</span>

{@render children()}
