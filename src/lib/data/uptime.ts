export type UptimeDayStatus = 'operational' | 'degraded' | 'outage' | 'unknown';

export type UptimeDay = {
	date: string;
	status: UptimeDayStatus;
	uptime: string;
};

const demoToday = new Date(Date.UTC(2026, 8, 2));

export const demoUptimeDays: UptimeDay[] = Array.from({ length: 90 }, (_, index) => {
	const date = new Date(demoToday);
	date.setUTCDate(demoToday.getUTCDate() - (89 - index));

	return {
		date: date.toISOString(),
		status: 'operational',
		uptime: '100%'
	};
});
