import type { UptimeDay } from '$lib/config/models';
import { statusSite } from '$lib/config/site';
import type { UptimeDayStatus } from '$lib/data/uptime';

export type StatusState = UptimeDayStatus;

export type StatusService = {
	id: string;
	name: string;
	detail: string;
	status: StatusState;
	uptime: number | null;
};

export const statusLabels: Record<StatusState, string> = statusSite.copy.statusLabels;

export const statusSymbols: Record<StatusState, string> = statusSite.copy.statusSymbols;

export const demoStatusSnapshot = statusSite.demo.statusSnapshot;

const demoServiceStates = statusSite.demo.serviceStates;

export const demoServices: StatusService[] = statusSite.serviceJourneys.map((service) => ({
	...service,
	...(demoServiceStates[service.id] ?? { status: 'unknown' as const, uptime: null })
}));

export function getOverallStatus(services: StatusService[]): StatusState {
	if (services.some((service) => service.status === 'outage')) return 'outage';
	if (services.some((service) => service.status === 'degraded')) return 'degraded';
	if (services.length === 0 || services.some((service) => service.status === 'unknown')) return 'unknown';
	return 'operational';
}

export function getAverageUptime(days: UptimeDay[]) {
	const measuredDays = days.filter((day): day is UptimeDay & { uptime: number } => day.uptime !== null);
	if (!measuredDays.length) return null;
	return measuredDays.reduce((total, day) => total + day.uptime, 0) / measuredDays.length;
}

export function formatUptime(value: number | null, precision = 2) {
	return value === null ? '—' : `${value.toFixed(precision)}%`;
}

export function formatCopy(template: string, replacements: Record<string, string | number>) {
	return Object.entries(replacements).reduce(
		(copy, [key, value]) => copy.replaceAll(`{${key}}`, String(value)),
		template
	);
}

export function formatServiceDetail(service: StatusService) {
	return formatCopy(statusSite.copy.service.details[service.status], {
		detail: service.detail
	});
}
