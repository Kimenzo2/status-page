<script lang="ts">
	import EmptyState from '$lib/components/EmptyState.svelte';
	import { statusSite } from '$lib/config/site';
	import {
		maintenanceStatusLabels,
		type MaintenanceEvent
	} from '$lib/data/maintenance';

	type CalendarDay = {
		date: string;
		event?: MaintenanceEvent;
	};

	type MonthLabel = {
		label: string;
		weekIndex: number;
	};

	let {
		events,
		startDate,
		endDate,
		locale,
		basePath = ''
	}: {
		events: MaintenanceEvent[];
		startDate: string;
		endDate: string;
		locale?: string;
		/** Tenant path prefix (e.g. "/faith") so calendar links stay inside the tenant prefix. */
		basePath?: string;
	} = $props();

	const withBase = (href: string) => `${basePath}${href}`;

	let calendar: HTMLDivElement | undefined = $state();
	let calendarShell: HTMLDivElement | undefined = $state();
	let calendarWidth = $state(0);
	let tooltipWidth = $state(0);
	let subscribed = $state(false);
	let hovered = $state<{
		date: string;
		event: MaintenanceEvent;
		left: number;
		top: number;
	}>();

	const copy = statusSite.copy.maintenance;

	const dateFormatter = $derived(
		new Intl.DateTimeFormat(locale ?? statusSite.locale, {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			timeZone: statusSite.timeZone
		})
	);

	const monthFormatter = $derived(
		new Intl.DateTimeFormat(locale ?? statusSite.locale, {
			month: 'short',
			timeZone: 'UTC'
		})
	);

	const timeFormatter = $derived(
		new Intl.DateTimeFormat(locale ?? statusSite.locale, {
			hour: 'numeric',
			minute: '2-digit',
			timeZone: statusSite.timeZone,
			timeZoneName: 'short'
		})
	);

	const weeks = $derived.by(() => {
		const start = parseDay(startDate);
		const end = parseDay(endDate);
		const eventDays = buildEventDays(events, start, end);
		const days: CalendarDay[] = [];
		const calendarStart = startOfWeek(start);
		const calendarEnd = endOfWeek(end);

		for (
			const cursor = new Date(calendarStart);
			cursor <= calendarEnd;
			cursor.setUTCDate(cursor.getUTCDate() + 1)
		) {
			const date = toDateKey(cursor);
			days.push({
				date,
				event: cursor >= start && cursor <= end ? eventDays.get(date) : undefined
			});
		}

		return Array.from({ length: Math.ceil(days.length / 7) }, (_, weekIndex) =>
			days.slice(weekIndex * 7, weekIndex * 7 + 7)
		);
	});

	const monthLabels = $derived.by(() => {
		const labels: MonthLabel[] = [];
		let previousMonth = '';

		for (const [weekIndex, week] of weeks.entries()) {
			const firstInRangeDay = week.find((day) => day.date >= startDate && day.date <= endDate);
			if (!firstInRangeDay) continue;

			const monthKey = firstInRangeDay.date.slice(0, 7);
			if (monthKey !== previousMonth) {
				labels.push({
					label: monthFormatter.format(parseDay(firstInRangeDay.date)),
					weekIndex
				});
				previousMonth = monthKey;
			}
		}

		return labels;
	});

	const tooltipLeft = $derived(
		hovered
			? Math.max(
					tooltipWidth / 2,
					Math.min(hovered.left, Math.max(tooltipWidth / 2, calendarWidth - tooltipWidth / 2))
			  )
			: 0
	);

	const firstEvent = $derived(events[0]);
	const firstEventHref = $derived(firstEvent ? withBase(`/maintenance?event=${encodeURIComponent(firstEvent.id)}`) : withBase('/maintenance'));

	function parseDay(value: string) {
		const [year, month, day] = value.slice(0, 10).split('-').map(Number);
		return new Date(Date.UTC(year, month - 1, day));
	}

	function toDateKey(date: Date) {
		return date.toISOString().slice(0, 10);
	}

	function startOfWeek(date: Date) {
		const result = new Date(date);
		result.setUTCDate(result.getUTCDate() - result.getUTCDay());
		return result;
	}

	function endOfWeek(date: Date) {
		const result = new Date(date);
		result.setUTCDate(result.getUTCDate() + (6 - result.getUTCDay()));
		return result;
	}

	function buildEventDays(eventsToMap: MaintenanceEvent[], start: Date, end: Date) {
		const eventDays = new Map<string, MaintenanceEvent>();

		for (const event of eventsToMap) {
			const eventStart = parseDay(event.start);
			const eventEnd = parseDay(event.end);
			const lastDay = eventEnd < eventStart ? eventStart : eventEnd;

			for (const cursor = new Date(eventStart); cursor <= lastDay; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
				if (cursor >= start && cursor <= end && !eventDays.has(toDateKey(cursor))) {
					eventDays.set(toDateKey(cursor), event);
				}
			}
		}

		return eventDays;
	}

	function formatEventWindow(event: MaintenanceEvent) {
		const start = new Date(event.start);
		const end = new Date(event.end);
		const startDate = dateFormatter.format(start);
		const endDate = dateFormatter.format(end);

		return startDate === endDate
			? `${startDate} · ${timeFormatter.format(start)}–${timeFormatter.format(end)}`
			: `${dateFormatter.format(start)} ${timeFormatter.format(start)}–${endDate} ${timeFormatter.format(end)}`;
	}

	function showEvent(day: CalendarDay, target: HTMLElement) {
		if (!day.event || !calendar) return;

		const targetRect = target.getBoundingClientRect();
		const calendarRect = (calendarShell ?? calendar).getBoundingClientRect();

		hovered = {
			date: day.date,
			event: day.event,
			left: targetRect.left - calendarRect.left + targetRect.width / 2,
			top: targetRect.top - calendarRect.top
		};
	}

	function handlePointerOver(event: PointerEvent) {
		showEventForTarget(event.target);
	}

	function handleFocus(event: FocusEvent) {
		showEventForTarget(event.currentTarget);
	}

	function showEventForTarget(value: EventTarget | null) {
		if (!calendar || !(value instanceof HTMLElement)) return;

		const target = value.closest<HTMLElement>('[data-maintenance-date]');
		if (!target || !calendar.contains(target)) return;

		const date = target.dataset.maintenanceDate;
		const day = weeks.flat().find((item) => item.date === date);
		if (day) showEvent(day, target);
	}

	function handleFocusOut(event: FocusEvent) {
		if (!calendar || (event.relatedTarget instanceof Node && calendar.contains(event.relatedTarget))) return;
		hovered = undefined;
	}

	function handlePointerLeave() {
		if (!calendar || !(document.activeElement instanceof Node) || !calendar.contains(document.activeElement)) {
			hovered = undefined;
		}
	}
</script>

<section class="maintenance-calendar" aria-labelledby="maintenance-calendar-title">
	<div class="maintenance-calendar__heading">
		<h2 id="maintenance-calendar-title">{copy.calendarTitle}</h2>
		<span>{events.length} {events.length === 1 ? copy.window : copy.windows}</span>
	</div>

	{#if events.length}
	<div class="maintenance-calendar__calendar-shell" bind:this={calendarShell} bind:clientWidth={calendarWidth}>
		<div
			class="maintenance-calendar__calendar"
			bind:this={calendar}
			onpointerover={handlePointerOver}
			onpointerleave={handlePointerLeave}
			onfocusout={handleFocusOut}
			role="group"
			aria-label={copy.calendarAriaLabel}
		>
			<div
				class="maintenance-calendar__months"
				style={`grid-template-columns: repeat(${weeks.length}, var(--status-maintenance-cell-size)); column-gap: var(--status-maintenance-cell-gap);`}
			>
				{#each monthLabels as month}
					<span style:grid-column={month.weekIndex + 1}>{month.label}</span>
				{/each}
			</div>

			<div
				class="maintenance-calendar__weeks"
				style={`grid-template-columns: repeat(${weeks.length}, var(--status-maintenance-cell-size)); column-gap: var(--status-maintenance-cell-gap);`}
			>
				{#each weeks as week}
					<div class="maintenance-calendar__week">
						{#each week as day}
							{#if day.event}
								<a
									class="maintenance-calendar__cell"
									class:maintenance-calendar__cell--scheduled={day.event.status === 'scheduled'}
									class:maintenance-calendar__cell--active={day.event.status === 'active'}
									class:maintenance-calendar__cell--completed={day.event.status === 'completed'}
									class:maintenance-calendar__cell--cancelled={day.event.status === 'cancelled'}
									data-maintenance-date={day.date}
									href={withBase(`/maintenance?event=${encodeURIComponent(day.event.id)}`)}
									aria-label={`${day.event.title}, ${maintenanceStatusLabels[day.event.status]}, ${formatEventWindow(day.event)}`}
									aria-describedby={hovered?.date === day.date ? 'maintenance-calendar-tooltip' : undefined}
									onfocus={handleFocus}
								></a>
							{:else}
								<span class="maintenance-calendar__cell maintenance-calendar__cell--empty" aria-hidden="true"></span>
							{/if}
						{/each}
					</div>
				{/each}
			</div>
		</div>

		{#if hovered}
			<div
				class="maintenance-calendar__tooltip"
				id="maintenance-calendar-tooltip"
				role="tooltip"
				style:left={`${tooltipLeft}px`}
				style:top={`${hovered.top}px`}
				bind:clientWidth={tooltipWidth}
			>
				<span class="maintenance-calendar__tooltip-date">{formatEventWindow(hovered.event)}</span>
				<span class="maintenance-calendar__tooltip-status">
					<span class="maintenance-calendar__status-mark" data-status={hovered.event.status} aria-hidden="true"></span>
					{maintenanceStatusLabels[hovered.event.status]} · {hovered.event.title}
				</span>
				<span class="maintenance-calendar__tooltip-summary">{hovered.event.summary}</span>
			</div>
		{/if}
	</div>

	<div class="maintenance-calendar__footer">
		<p>{events.length} {events.length === 1 ? copy.maintenanceWindow : copy.maintenanceWindows} {copy.scheduledSuffix}</p>
		<div class="maintenance-calendar__legend" role="group" aria-label={copy.calendarTitle}>
			<span>{copy.noScheduledWork}</span>
			<span class="maintenance-calendar__legend-cell maintenance-calendar__cell--empty" aria-hidden="true"></span>
			<span class="maintenance-calendar__legend-cell maintenance-calendar__cell--scheduled" aria-hidden="true"></span>
			<span>{copy.scheduled}</span>
		</div>
	</div>

	<div class="maintenance-calendar__actions">
		<p>{copy.reviewPrompt}</p>
		<div class="maintenance-calendar__buttons">
			<a class="maintenance-calendar__action maintenance-calendar__action--primary" href={firstEventHref}>
				<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /></svg>
				{copy.reviewAction}
			</a>
			<button
				class="maintenance-calendar__action maintenance-calendar__action--secondary"
				type="button"
				aria-pressed={subscribed}
				onclick={() => (subscribed = !subscribed)}
			>
				<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 5.5h16v13H4zM4 6l8 6 8-6" /></svg>
				{subscribed ? statusSite.copy.subscribed : copy.subscribeAction}
			</button>
		</div>
		<span class="sr-only" role="status" aria-live="polite">
			{#if subscribed}{copy.updateSubscribed}{:else}{copy.updateUnsubscribed}{/if}
		</span>
	</div>
	{:else}
		<EmptyState state={statusSite.copy.emptyStates.maintenanceCalendar} compact />
	{/if}
</section>

<style>
	.maintenance-calendar {
		margin-top: 28px;
		padding: 16px;
		border-radius: var(--status-radius-surface);
		background: var(--status-surface);
		color: var(--status-ink);
	}

	.maintenance-calendar__heading,
	.maintenance-calendar__footer,
	.maintenance-calendar__actions,
	.maintenance-calendar__buttons,
	.maintenance-calendar__legend {
		display: flex;
		align-items: center;
	}

	.maintenance-calendar__heading,
	.maintenance-calendar__footer,
	.maintenance-calendar__actions {
		justify-content: space-between;
		gap: 16px;
	}

	.maintenance-calendar__heading h2 {
		margin: 0;
		font-size: var(--status-text-title-sm);
		font-weight: 500;
		letter-spacing: -0.02em;
	}

	.maintenance-calendar__heading > span,
	.maintenance-calendar__footer,
	.maintenance-calendar__actions > p {
		color: var(--status-ink-soft);
		font-size: var(--status-text-ui);
	}

	.maintenance-calendar__calendar-shell {
		position: relative;
		width: 100%;
		min-width: 0;
		max-width: 100%;
		margin-top: 22px;
	}

	.maintenance-calendar__calendar {
		width: 100%;
		min-width: 0;
		max-width: 100%;
		overflow-x: auto;
		overflow-y: hidden;
		scrollbar-width: none;
	}

	.maintenance-calendar__calendar::-webkit-scrollbar {
		display: none;
	}

	.maintenance-calendar__months,
	.maintenance-calendar__weeks {
		display: grid;
		width: max-content;
		min-width: max-content;
		margin-inline: auto;
	}

	.maintenance-calendar__months {
		margin-bottom: 9px;
		color: var(--status-ink);
		font-size: var(--status-text-ui-lg);
		font-weight: 500;
		line-height: 1.25;
	}

	.maintenance-calendar__months span {
		white-space: nowrap;
	}

	.maintenance-calendar__weeks {
		grid-auto-flow: column;
	}

	.maintenance-calendar__week {
		display: grid;
		grid-template-rows: repeat(7, var(--status-maintenance-cell-size));
		gap: var(--status-maintenance-cell-gap);
	}

	.maintenance-calendar__cell {
		display: block;
		width: var(--status-maintenance-cell-size);
		height: var(--status-maintenance-cell-size);
		padding: 0;
		border: 0;
		border-radius: 2px;
		background: var(--status-maintenance-mark);
		text-decoration: none;
	}

	.maintenance-calendar__cell--empty {
		background: var(--status-canvas);
	}

	.maintenance-calendar__cell--scheduled {
		background: var(--status-maintenance);
	}

	.maintenance-calendar__cell--active {
		background: var(--status-warning);
	}

	.maintenance-calendar__cell--completed {
		background: var(--status-maintenance-mark);
	}

	.maintenance-calendar__cell--cancelled {
		background: var(--status-critical-mark);
	}

	.maintenance-calendar__cell:focus-visible {
		position: relative;
		z-index: 1;
		outline: 2px solid var(--status-focus);
		outline-offset: 3px;
	}

	.maintenance-calendar__tooltip {
		position: absolute;
		z-index: 2;
		display: grid;
		max-width: min(300px, calc(100vw - 32px));
		gap: 3px;
		padding: 8px 10px;
		border-radius: 10px;
		background: var(--status-canvas);
		color: var(--status-ink);
		font-size: var(--status-text-caption);
		line-height: 1.35;
		pointer-events: none;
		transform: translate(-50%, calc(-100% - 7px));
	}

	.maintenance-calendar__tooltip-date {
		color: var(--status-ink-soft);
		font-variant-numeric: tabular-nums;
	}

	.maintenance-calendar__tooltip-status {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-weight: 600;
	}

	.maintenance-calendar__tooltip-summary {
		max-width: 36ch;
		color: var(--status-ink-soft);
		text-wrap: pretty;
	}

	.maintenance-calendar__status-mark {
		width: 6px;
		height: 6px;
		flex: 0 0 auto;
		border-radius: 50%;
		background: var(--status-maintenance);
	}

	.maintenance-calendar__status-mark[data-status='active'] {
		background: var(--status-warning);
	}

	.maintenance-calendar__status-mark[data-status='completed'] {
		background: var(--status-maintenance-mark);
	}

	.maintenance-calendar__status-mark[data-status='cancelled'] {
		background: var(--status-critical);
	}

	.maintenance-calendar__footer {
		margin-top: 18px;
	}

	.maintenance-calendar__footer p {
		margin: 0;
	}

	.maintenance-calendar__legend {
		justify-content: flex-end;
		gap: 5px;
		white-space: nowrap;
	}

	.maintenance-calendar__legend-cell {
		width: var(--status-maintenance-cell-size);
		height: var(--status-maintenance-cell-size);
		border-radius: 2px;
	}

	.maintenance-calendar__legend-cell:first-of-type {
		margin-inline-start: 3px;
	}

	.maintenance-calendar__actions {
		align-items: flex-start;
		flex-direction: column;
		gap: 12px;
		margin-top: 22px;
		padding-top: 16px;
	}

	.maintenance-calendar__actions > p {
		margin: 0;
		color: var(--status-ink);
		font-size: var(--status-text-body-sm);
		line-height: 1.5;
	}

	.maintenance-calendar__buttons {
		flex: 0 0 auto;
		gap: 8px;
	}

	.maintenance-calendar__action {
		display: inline-flex;
		min-width: 0;
		min-height: 40px;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 8px 12px;
		border: 0;
		border-radius: var(--status-radius-control);
		font-size: var(--status-text-ui);
		font-weight: 600;
		line-height: 1.2;
		text-decoration: none;
		white-space: nowrap;
	}

	.maintenance-calendar__action svg {
		width: 17px;
		height: 17px;
		fill: none;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 1.8;
	}

	.maintenance-calendar__action--primary {
		background: var(--status-ink);
		color: var(--status-canvas);
	}

	.maintenance-calendar__action--secondary {
		background: var(--status-surface-hover);
		color: var(--status-ink);
		cursor: pointer;
	}

	@media (hover: hover) {
		.maintenance-calendar__action--primary:hover {
			background: var(--status-ink-soft);
		}

		.maintenance-calendar__action--secondary:hover {
			background: var(--status-surface-muted);
		}
	}

	@media (max-width: 38.75rem) {
		.maintenance-calendar {
			padding: 14px;
		}

		.maintenance-calendar__footer,
		.maintenance-calendar__actions {
			align-items: flex-start;
			flex-direction: column;
		}

		.maintenance-calendar__legend {
			justify-content: flex-start;
		}

		.maintenance-calendar__buttons {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
			width: 100%;
		}

		.maintenance-calendar__action {
			width: 100%;
			min-height: 44px;
		}
	}
</style>
