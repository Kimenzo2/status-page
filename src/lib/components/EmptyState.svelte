<script lang="ts">
	import { page } from '$app/state';
	import { isReservedAppSegment, isSlugShaped } from '$lib/tenantRouting';
	import type { EmptyStateCopy } from '$lib/config/models';

	let {
		state,
		compact = false,
		heading = 'p'
	}: {
		state: EmptyStateCopy;
		compact?: boolean;
		heading?: 'p' | 'h2' | 'h3';
	} = $props();

	// Path-based tenants keep internal links inside their prefix; derive it
	// from the visible URL (the reroute hook strips it for route matching).
	const tenantPrefix = $derived.by(() => {
		const segment = page.url.pathname.split('/')[1] ?? '';
		return segment && isSlugShaped(segment) && !isReservedAppSegment(segment) ? `/${segment}` : '';
	});
</script>

<div class="empty-state" class:empty-state--compact={compact} data-tone={state.tone ?? 'neutral'}>
	<span
		class="empty-state__illustration"
		data-illustration={state.illustration.name}
		style={`--empty-illustration: url("${state.illustration.src}");`}
		aria-hidden="true"
	></span>
	<div class="empty-state__copy">
		<svelte:element this={heading} class="empty-state__title">{state.title}</svelte:element>
		<p>{state.summary}</p>
		{#if state.action}
			<a class="empty-state__action" href={`${tenantPrefix}${state.action.href}`}>
				{state.action.label}<span aria-hidden="true">↗</span>
			</a>
		{/if}
	</div>
</div>

<style>
	.empty-state {
		display: grid;
		grid-template-columns: 64px minmax(0, 1fr);
		align-items: center;
		gap: 20px;
		padding-block: 28px;
	}

	.empty-state--compact {
		grid-template-columns: 48px minmax(0, 1fr);
		gap: 16px;
		padding-block: 20px;
	}

	.empty-state__illustration {
		display: block;
		width: 64px;
		height: 64px;
		background: currentColor;
		color: var(--status-ink-soft);
		pointer-events: none;
		-webkit-mask: var(--empty-illustration) center / contain no-repeat;
		-webkit-mask-mode: alpha;
		mask: var(--empty-illustration) center / contain no-repeat;
		mask-mode: alpha;
	}

	.empty-state--compact .empty-state__illustration {
		width: 48px;
		height: 48px;
	}

	.empty-state[data-tone='positive'] .empty-state__illustration {
		color: var(--status-positive-strong);
	}

	.empty-state[data-tone='maintenance'] .empty-state__illustration {
		color: var(--status-maintenance-strong);
	}

	.empty-state__copy {
		min-width: 0;
	}

	.empty-state__title {
		margin: 0;
		color: var(--status-ink);
		font-size: var(--status-text-title-sm);
		font-weight: 500;
		letter-spacing: -0.02em;
		line-height: 1.25;
		text-wrap: balance;
	}

	.empty-state__copy p {
		max-width: 55ch;
		margin: 7px 0 0;
		color: var(--status-ink-soft);
		font-size: var(--status-text-body-sm);
		line-height: 1.5;
		text-wrap: pretty;
	}

	.empty-state__action {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		margin-top: 14px;
		color: var(--status-ink);
		font-size: var(--status-text-ui);
		font-weight: 600;
		text-underline-offset: 4px;
	}

	.empty-state__action span {
		font-size: 1.05em;
		line-height: 1;
	}

	@media (max-width: 38.75rem) {
		.empty-state {
			grid-template-columns: 48px minmax(0, 1fr);
			gap: 16px;
			padding-block: 22px;
		}

		.empty-state--compact {
			grid-template-columns: 40px minmax(0, 1fr);
			gap: 14px;
			padding-block: 18px;
		}

		.empty-state__illustration,
		.empty-state--compact .empty-state__illustration {
			width: 48px;
			height: 48px;
		}

		.empty-state--compact .empty-state__illustration {
			width: 40px;
			height: 40px;
		}
	}
</style>
