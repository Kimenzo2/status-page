import { env } from '$env/dynamic/public';
import type { EmptyStateCopy, Incident, MaintenanceEvent, StatusCardCopy, StatusState, UptimeOverride } from './models';

const configuredName = env.PUBLIC_STATUS_NAME?.trim();
const configuredLogo = env.PUBLIC_STATUS_LOGO_URL?.trim();
const configuredLocale = env.PUBLIC_STATUS_LOCALE?.trim();
const configuredTimeZone = env.PUBLIC_STATUS_TIMEZONE?.trim();

type DemoConfig = {
	statusSnapshot: {
		lastVerified: string;
	};
	serviceStates: Record<string, { status: StatusState; uptime: number | null }>;
	uptime: {
		today: string;
		days: number;
		default: Pick<UptimeOverride, 'status' | 'uptime'>;
		overrides: UptimeOverride[];
		serviceOverrides: Record<string, UptimeOverride[]>;
	};
	incidents: Incident[];
	maintenance: {
		events: MaintenanceEvent[];
		calendar: {
			start: string;
			end: string;
		};
	};
};

export const statusSite = {
	name: configuredName || 'Example Company',
	logo: configuredLogo || '/starter-mark.svg',
	locale: configuredLocale || 'en-US',
	timeZone: configuredTimeZone || 'Africa/Nairobi',

	// Editable public service journeys. Monitor adapters provide their live state separately.
	serviceJourneys: [
		{ id: 'sign-in', name: 'Sign in', detail: 'Authentication and account access' },
		{ id: 'dashboard', name: 'Dashboard', detail: 'Workspace loading and saved changes' },
		{ id: 'api-requests', name: 'API requests', detail: 'API v1 and API v2' },
		{ id: 'file-uploads', name: 'File uploads', detail: 'Uploads and file processing' }
	],
	navigation: [
		{ href: '/', label: 'Overview' },
		{ href: '/incidents', label: 'Incidents' },
		{ href: '/maintenance', label: 'Maintenance' },
		{ href: '/uptime', label: 'Uptime' }
	],

	// The public starter theme is centralized here. Change these values once and every route follows them.
	theme: {
		cssVariables: {
			'--status-font-sans': 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", Arial, sans-serif',
			'--gray-950': 'oklch(0.162 0 0)',
			'--gray-900': 'oklch(0.215 0 0)',
			'--gray-850': 'oklch(0.25 0 0)',
			'--gray-800': 'oklch(0.286 0 0)',
			'--gray-700': 'oklch(0.34 0 0)',
			'--mono-black': 'oklch(0 0 0)',
			'--mono-white': 'oklch(1 0 0)',
			'--warm-50': 'oklch(0.9568 0.0119 79.8)',
			'--warm-200': 'oklch(0.8909 0.0242 78)',
			'--warm-300': 'oklch(0.8411 0.0304 78)',
			'--warm-400': 'oklch(0.7281 0.0163 78)',
			'--warm-500': 'oklch(0.6132 0.017 78)',
			'--warm-700': 'oklch(0.2296 0.0098 78)',
			'--green-1': 'oklch(0.178 0.029 145)',
			'--green-2': 'oklch(0.209 0.041 145)',
			'--green-3': 'oklch(0.272 0.076 145)',
			'--green-4': 'oklch(0.322 0.103 145)',
			'--green-5': 'oklch(0.367 0.125 145)',
			'--green-6': 'oklch(0.417 0.145 145)',
			'--green-7': 'oklch(0.484 0.164 145)',
			'--green-8': 'oklch(0.571 0.181 145)',
			'--green-9': 'oklch(0.623 0.178 145)',
			'--green-10': 'oklch(0.676 0.167 145)',
			'--green-11': 'oklch(0.843 0.107 145)',
			'--green-12': 'oklch(0.919 0.063 145)',
			'--amber-1': 'oklch(0.193 0.027 75)',
			'--amber-2': 'oklch(0.224 0.038 75)',
			'--amber-9': 'oklch(0.733 0.194 75)',
			'--amber-11': 'oklch(0.894 0.11 75)',
			'--red-1': 'oklch(0.195 0.03 17)',
			'--red-2': 'oklch(0.227 0.041 17)',
			'--red-9': 'oklch(0.647 0.176 17)',
			'--red-11': 'oklch(0.863 0.102 17)',
			'--purple-1': 'oklch(0.183 0.027 295)',
			'--purple-2': 'oklch(0.214 0.038 295)',
			'--purple-9': 'oklch(0.637 0.185 295)',
			'--purple-11': 'oklch(0.853 0.107 295)',
			'--status-canvas': 'var(--gray-950)',
			'--status-surface': 'var(--gray-900)',
			'--status-surface-muted': 'var(--gray-850)',
			'--status-surface-hover': 'var(--gray-800)',
			'--status-surface-reflection': 'color-mix(in oklab, var(--status-surface) 96%, var(--status-ink) 4%)',
			'--status-ink': 'var(--warm-50)',
			'--status-ink-soft': 'var(--warm-400)',
			'--status-ink-faint': 'var(--warm-500)',
			'--status-line': 'oklch(1 0 0 / 0.1)',
			'--status-line-soft': 'oklch(1 0 0 / 0.06)',
			'--status-shadow': 'color-mix(in oklab, var(--mono-black) 20%, transparent)',
			'--status-shadow-soft': 'color-mix(in oklab, var(--mono-black) 18%, transparent)',
			'--status-positive': 'var(--green-9)',
			'--status-positive-strong': 'var(--green-11)',
			'--status-positive-surface': 'var(--green-2)',
			'--status-on-positive': 'var(--green-1)',
			'--status-positive-border': 'color-mix(in oklab, var(--green-9) 28%, transparent)',
			'--status-positive-mark': 'color-mix(in oklab, var(--green-9) 62%, transparent)',
			'--status-warning': 'var(--amber-9)',
			'--status-warning-strong': 'var(--amber-11)',
			'--status-warning-surface': 'var(--amber-2)',
			'--status-on-warning': 'var(--amber-1)',
			'--status-warning-border': 'color-mix(in oklab, var(--amber-9) 30%, transparent)',
			'--status-warning-mark': 'color-mix(in oklab, var(--amber-9) 68%, transparent)',
			'--status-critical': 'var(--red-9)',
			'--status-critical-strong': 'var(--red-11)',
			'--status-critical-surface': 'var(--red-2)',
			'--status-on-critical': 'var(--red-1)',
			'--status-critical-border': 'color-mix(in oklab, var(--red-9) 30%, transparent)',
			'--status-critical-mark': 'color-mix(in oklab, var(--red-9) 68%, transparent)',
			'--status-maintenance': 'var(--purple-9)',
			'--status-maintenance-strong': 'var(--purple-11)',
			'--status-maintenance-surface': 'var(--purple-2)',
			'--status-on-maintenance': 'var(--purple-1)',
			'--status-maintenance-border': 'color-mix(in oklab, var(--purple-9) 30%, transparent)',
			'--status-maintenance-mark': 'color-mix(in oklab, var(--purple-9) 68%, transparent)',
			'--status-unknown': 'var(--status-ink-soft)',
			'--status-unknown-strong': 'var(--status-ink)',
			'--status-unknown-surface': 'var(--gray-850)',
			'--status-unknown-border': 'var(--status-line)',
			'--status-unknown-mark': 'color-mix(in oklab, var(--status-ink-soft) 62%, transparent)',
			'--status-focus': 'var(--warm-200)',
			'--status-selection': 'var(--warm-300)',
			'--status-selection-ink': 'var(--warm-700)',
			'--status-radius-control': '10px',
			'--status-radius-row': '12px',
			'--status-radius-surface': '16px',
			'--status-radius-panel': '22px',
			'--status-content-width': '900px',
			'--status-maintenance-cell-size': '11px',
			'--status-maintenance-cell-gap': '3px',
			'--status-text-caption': '0.75rem',
			'--status-text-ui': '0.8125rem',
			'--status-text-ui-lg': '0.875rem',
			'--status-text-body-sm': '0.9375rem',
			'--status-text-body': '1rem',
			'--status-text-title-sm': '1.0625rem',
			'--status-text-title-md': '1.6875rem',
			'--status-text-title-lg': '1.875rem',
			'--status-text-display': 'clamp(2.35rem, 5vw, 4rem)',
			'--status-text-display-mobile': 'clamp(2.2rem, 12vw, 3.2rem)',
			'--status-text-card-title': 'clamp(2rem, 4vw, 2.75rem)',
			'--status-text-card-title-mobile': 'clamp(1.75rem, 8vw, 2.25rem)',
			'--status-text-card-summary': '1.125rem'
		}
	},

	copy: {
		pageTitle: '{title} | {site} status',
		accessibility: {
			skipToContent: 'Skip to content',
			brandLabel: '{site} status overview'
		},
		navigationAriaLabel: 'Status pages',
		subscribe: 'Subscribe',
		unsubscribe: 'Unsubscribe',
		subscribed: 'Subscribed',
		subscriptionAnnouncement: {
			subscribed: 'You are subscribed to {site} status updates.',
			unsubscribed: 'You are not subscribed to {site} status updates.'
		},
		timeRange: {
			ago: '{days} days ago',
			today: 'Today'
		},
		serviceGroup: {
			serviceLabel: 'Service components',
			totalCount: '{count} services',
			affectedCount: '{count} affected',
			ariaLabel: '{label} status'
		},
		statusLabels: {
			operational: 'Operational',
			degraded: 'Degraded',
			outage: 'Outage',
			unknown: 'Verification delayed'
		},
		statusSymbols: {
			operational: '✓',
			degraded: '!',
			outage: '×',
			unknown: '?'
		},
		emptyStates: {
			overviewIncidents: {
				illustration: { name: 'shield', src: '/illustrations/reicon/shield.svg' },
				title: 'No active incidents',
				summary: 'All published service signals are operating normally.',
				tone: 'positive',
				action: { label: 'View incident history', href: '/incidents' }
			},
			overviewServices: {
				illustration: { name: 'package', src: '/illustrations/reicon/package.svg' },
				title: 'No services configured',
				summary: 'Customer-facing services will appear here once they are connected.'
			},
			incidentHistory: {
				illustration: { name: 'clipboard', src: '/illustrations/reicon/clipboard.svg' },
				title: 'No incidents reported',
				summary: 'There are no public incidents in this history yet.',
				action: { label: 'View uptime', href: '/uptime' }
			},
			maintenance: {
				illustration: { name: 'construction', src: '/illustrations/reicon/construction.svg' },
				title: 'No scheduled maintenance',
				summary: 'There is no planned work published for this service.',
				tone: 'maintenance'
			},
			maintenanceCalendar: {
				illustration: { name: 'calendar', src: '/illustrations/reicon/calendar.svg' },
				title: 'No scheduled work',
				summary: 'Planned maintenance will appear here when it is published.',
				tone: 'maintenance'
			},
			uptime: {
				illustration: { name: 'chart', src: '/illustrations/reicon/chart.svg' },
				title: 'No uptime data yet',
				summary: 'Availability history will appear here after monitoring starts.',
				tone: 'positive'
			},
			serviceJourneys: {
				illustration: { name: 'package', src: '/illustrations/reicon/package.svg' },
				title: 'No service journeys configured',
				summary: 'Customer-facing service journeys will appear here once they are connected.'
			}
		} satisfies Record<string, EmptyStateCopy>,
		overview: {
			title: 'Overview',
			metaDescription: 'Current service health and availability for {site}.',
			kicker: 'service status',
			headlines: {
				operational: 'All services are online',
				degraded: 'Some services are degraded',
				outage: 'Some services are unavailable',
				unknown: 'Service status is being verified'
			},
			// Keep this map source-editable. Webhook/monitor adapters only need to publish a StatusState.
			statusCard: {
				operational: {
					title: 'All systems operational',
					summary: 'No active service problems are affecting this product.'
				},
				degraded: {
					title: 'Some systems have degraded',
					summary: 'Some services are operating below normal levels while the team investigates.'
				},
				outage: {
					title: 'Some systems are unavailable',
					summary: 'The team is investigating an active service problem.'
				},
				unknown: {
					title: 'System status is being verified',
					summary: 'The latest service signals have not been verified yet.'
				}
			} satisfies Record<StatusState, StatusCardCopy>,
			verified: 'Last verified',
			uptimeLabel: '{uptime} uptime',
			uptimeAriaLabel: '{days} days of {status} uptime for {site}',
			serviceGroupAriaLabel: 'Service health for {site}'
		},
		incidents: {
			title: 'Incidents',
			description: 'Current and past service events.',
			metaDescription: 'Current and recent incidents for {site}.',
			overviewLabel: 'Incident update',
			noActiveTitle: 'No active incidents',
			operationalSummary: 'All services are operating normally.',
			historyTitle: 'History',
			historyPeriod: 'Last {days} days',
			empty: 'No incidents reported.',
			viewUptime: 'View uptime',
			viewHistory: 'View incident history',
			affectedServices: 'Affected services',
			incident: 'incident',
			incidents: 'incidents',
			historyHref: '/incidents',
			previousUpdate: 'previous update',
			previousUpdates: 'previous updates',
			hidePreviousUpdates: 'Hide previous updates',
			noUpdates: 'No public updates were recorded for this incident.',
			symbols: {
				investigating: '!',
				identified: '!',
				monitoring: '~',
				resolved: '✓'
			},
			states: {
				investigating: 'Investigating',
				identified: 'Identified',
				monitoring: 'Monitoring',
				resolved: 'Resolved'
			}
		},
		maintenance: {
			title: 'Maintenance',
			description: 'Planned work for {site}.',
			metaDescription: 'Scheduled maintenance for {site}.',
			emptyTitle: 'No scheduled maintenance',
			emptySummary: 'There is no scheduled work for {site}.',
			affectedServices: 'Affected services',
			updateNote: 'Updates will appear here if the maintenance changes service availability.',
			calendarTitle: 'Maintenance calendar',
			calendarAriaLabel: 'Maintenance activity across the year',
			window: 'window',
			windows: 'windows',
			maintenanceWindow: 'maintenance window',
			maintenanceWindows: 'maintenance windows',
			allServices: 'All services',
			noScheduledWork: 'No scheduled work',
			scheduled: 'Scheduled',
			scheduledSuffix: 'scheduled',
			reviewPrompt: 'Review the scheduled work or subscribe to status updates.',
			reviewAction: 'Review maintenance',
			subscribeAction: 'Subscribe to updates',
			updateSubscribed: 'You are subscribed to maintenance updates.',
			updateUnsubscribed: 'You are not subscribed to maintenance updates.',
			states: {
				scheduled: 'Scheduled',
				active: 'In progress',
				completed: 'Completed',
				cancelled: 'Cancelled'
			}
		},
		uptime: {
			title: 'Uptime',
			description: 'Availability across {site} service journeys.',
			metaDescription: '{site} availability history for {period}.',
			serviceJourneys: 'Service journeys',
			verified: 'Last verified',
			period: '{days} days',
			uptimeAriaLabel: '{days} days of {status} availability for {site}',
			each: '{uptime} each',
			metricSuffix: 'uptime',
			unavailable: 'Uptime unavailable',
			defaultAriaLabel: 'Daily uptime history'
		},
		service: {
			details: {
				operational: '{detail}. No active incidents reported.',
				degraded: '{detail}. Availability is currently degraded.',
				outage: '{detail}. This service is currently unavailable.',
				unknown: '{detail}. Verification is delayed.'
			}
		},
		diagnostics: {
			title: 'StatusShell break report',
			metaDescription: 'Temporary stress-test scenarios for the shared status shell.',
			intro: 'This temporary page renders the production shell in every applicable scenario. The shell is unchanged; only labels, container widths, and fixture content were added.',
			fixture: 'Fixture content for the {scenario} scenario.',
			observation: 'Observation pending: inspect this scenario in the browser.',
			scenarios: [
				{
					id: 'container-320',
					name: '320px container',
					description: 'The narrowest supported container; tab through every control and inspect wrapping.',
					className: 'scenario-container--320'
				},
				{
					id: 'squeezed-flex-sibling',
					name: 'Squeezed flex sibling',
					description: 'The shell must shrink inside a constrained grid track without forcing horizontal overflow.',
					className: 'scenario-container--squeezed'
				},
				{
					id: 'wide-container',
					name: 'Very wide container',
					description: 'A wide host checks that the shell keeps its intended measure instead of stretching to the edges.',
					className: 'scenario-container--wide'
				},
				{
					id: 'subscription-state',
					name: 'Subscription state',
					description: 'Initial state is unsubscribed. Activate Subscribe to exercise the reachable subscribed state.',
					className: 'scenario-container--state'
				}
			]
		}
	},

	// Source-editable fixture data for the starter kit. Replace this block with monitor/API adapters in production.
	demo: {
		statusSnapshot: {
			lastVerified: '2026-09-02T14:13:00+03:00'
		},
		serviceStates: {
			'sign-in': { status: 'operational', uptime: 100 },
			dashboard: { status: 'operational', uptime: 100 },
			'api-requests': { status: 'operational', uptime: 100 },
			'file-uploads': { status: 'operational', uptime: 100 }
		} as DemoConfig['serviceStates'],
		uptime: {
			today: '2026-09-02',
			days: 90,
			default: { status: 'operational', uptime: 100 },
			overrides: [],
			serviceOverrides: {} as DemoConfig['uptime']['serviceOverrides']
		},
		incidents: [
			{
				id: 'sign-in-unavailable-2026-09-02',
				title: 'Sign-in unavailable',
				summary: 'Some customers are unable to sign in while the authentication service is being stabilized.',
				status: 'resolved',
				startedAt: '2026-09-02T13:42:00+03:00',
				resolvedAt: '2026-09-02T15:18:00+03:00',
				affectedServices: ['sign-in'],
				updates: [
					{
						id: 'sign-in-unavailable-2026-09-02-resolved',
						status: 'resolved',
						publishedAt: '2026-09-02T15:18:00+03:00',
						message: 'Sign-in has recovered and we are continuing to monitor authentication health.'
					},
					{
						id: 'sign-in-unavailable-2026-09-02-identified',
						status: 'identified',
						publishedAt: '2026-09-02T14:07:00+03:00',
						message: 'The team identified an authentication issue and is applying a mitigation. Sign-in may continue to fail for some customers.'
					},
					{
						id: 'sign-in-unavailable-2026-09-02-investigating',
						status: 'investigating',
						publishedAt: '2026-09-02T13:48:00+03:00',
						message: 'We are investigating reports of failed sign-ins and checking authentication health across regions.'
					}
				]
			},
			{
				id: 'elevated-api-latency-2026-08-20',
				title: 'Elevated API latency',
				summary: 'Some API requests took longer than usual while the team stabilized a regional dependency.',
				status: 'resolved',
				startedAt: '2026-08-20T14:02:00+03:00',
				resolvedAt: '2026-08-20T14:48:00+03:00',
				affectedServices: ['api-requests'],
				updates: [
					{
						id: 'elevated-api-latency-2026-08-20-resolved',
						status: 'resolved',
						publishedAt: '2026-08-20T14:48:00+03:00',
						message: 'The issue has been resolved. API latency has returned to normal and we are continuing to monitor the dependency.'
					},
					{
						id: 'elevated-api-latency-2026-08-20-monitoring',
						status: 'monitoring',
						publishedAt: '2026-08-20T14:31:00+03:00',
						message: 'A mitigation is in place and response times are improving. We are monitoring recovery across regions.'
					},
					{
						id: 'elevated-api-latency-2026-08-20-identified',
						status: 'identified',
						publishedAt: '2026-08-20T14:12:00+03:00',
						message: 'The team identified a regional dependency as the source of elevated API latency and is applying a mitigation.'
					}
				]
			},
			{
				id: 'configuration-propagation-2026-07-24',
				title: 'Configuration changes delayed',
				summary: 'Some configuration updates took longer than expected to propagate.',
				status: 'resolved',
				startedAt: '2026-07-24T22:18:00+03:00',
				resolvedAt: '2026-07-25T02:59:00+03:00',
				affectedServices: ['dashboard', 'api-requests'],
				updates: [
					{
						id: 'configuration-propagation-2026-07-25-resolved',
						status: 'resolved',
						publishedAt: '2026-07-25T02:59:00+03:00',
						message: 'The issue has been resolved. Configuration changes now propagate as expected.'
					},
					{
						id: 'configuration-propagation-2026-07-24-investigating',
						status: 'investigating',
						publishedAt: '2026-07-24T22:36:00+03:00',
						message: 'We are investigating reports of delayed configuration updates and checking propagation across regions.'
					}
				]
			}
		] satisfies Incident[],
		maintenance: {
			events: [
				{
					id: 'scheduled-maintenance-2026-09-03',
					title: 'Scheduled maintenance',
					summary: 'Planned maintenance is scheduled. Customer impact has not been confirmed.',
					start: '2026-09-03T03:00:00+03:00',
					end: '2026-09-03T04:00:00+03:00',
					status: 'scheduled',
					affectedServices: ['*']
				}
			] satisfies MaintenanceEvent[],
			calendar: {
				start: '2026-01-01',
				end: '2026-12-31'
			}
		}
	} satisfies DemoConfig
};

export function getStatusThemeStyle() {
	return Object.entries(statusSite.theme.cssVariables)
		.map(([property, value]) => `${property}: ${value}`)
		.join('; ');
}
