import type { StatusState, UptimeDay, UptimeOverride } from '$lib/config/models';
import { statusSite } from '$lib/config/site';

export type UptimeDayStatus = StatusState;
export type { UptimeDay };

const uptimeConfig = statusSite.demo.uptime;

function parseDate(value: string) {
	return new Date(`${value.slice(0, 10)}T00:00:00.000Z`);
}

function toDateKey(value: string | Date) {
	return typeof value === 'string' ? value.slice(0, 10) : value.toISOString().slice(0, 10);
}

function buildOverrideMap(overrides: UptimeOverride[]) {
	return new Map(overrides.map((override) => [override.date.slice(0, 10), override]));
}

const overallOverrides = buildOverrideMap(uptimeConfig.overrides);
const rangeDays = Math.max(0, Math.floor(uptimeConfig.days));
const today = parseDate(uptimeConfig.today);

export const demoUptimeDays: UptimeDay[] = Array.from({ length: rangeDays }, (_, index) => {
	const date = new Date(today);
	date.setUTCDate(today.getUTCDate() - (rangeDays - 1 - index));
	const dateKey = toDateKey(date);
	const override = overallOverrides.get(dateKey);

	return {
		date: date.toISOString(),
		status: override?.status ?? uptimeConfig.default.status,
		uptime: override?.uptime ?? uptimeConfig.default.uptime,
		note: override?.note
	};
});

export function getServiceUptimeDays(serviceId: string, status: UptimeDayStatus, uptime: number | null) {
	const serviceOverrides = buildOverrideMap(uptimeConfig.serviceOverrides[serviceId] ?? []);

	return demoUptimeDays.map((day) => {
		const override = serviceOverrides.get(toDateKey(day.date));
		if (override) {
			return {
				...day,
				status: override.status,
				uptime: override.uptime,
				note: override.note
			};
		}

		if (toDateKey(day.date) === uptimeConfig.today.slice(0, 10)) {
			return {
				...day,
				status,
				uptime,
				note: status === 'outage' ? day.note : undefined
			};
		}

		return day;
	});
}
