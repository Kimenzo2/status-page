export type StatusState = 'operational' | 'degraded' | 'outage' | 'unknown';

/**
 * Public status-card copy is editable configuration. Live monitor or webhook
 * adapters provide the StatusState; the public surface selects this copy map.
 */
export type StatusCardCopy = {
	title: string;
	summary: string;
};

export type EmptyStateTone = 'positive' | 'maintenance' | 'neutral';

export type EmptyStateCopy = {
	illustration: {
		name: string;
		src: string;
	};
	title: string;
	summary: string;
	tone?: EmptyStateTone;
	action?: {
		label: string;
		href: string;
	};
};

export type UptimeDay = {
	date: string;
	status: StatusState;
	uptime: number | null;
	note?: string;
};

export type UptimeOverride = {
	date: string;
	status: StatusState;
	uptime: number | null;
	note?: string;
};

export type IncidentStatus = 'investigating' | 'identified' | 'monitoring' | 'resolved';

export type IncidentUpdate = {
	id: string;
	status: IncidentStatus;
	publishedAt: string;
	message: string;
};

export type Incident = {
	id: string;
	title: string;
	summary: string;
	status: IncidentStatus;
	startedAt: string;
	resolvedAt?: string;
	affectedServices: string[];
	updates: IncidentUpdate[];
};

export type MaintenanceStatus = 'scheduled' | 'active' | 'completed' | 'cancelled';

export type MaintenanceEvent = {
	id: string;
	title: string;
	summary: string;
	start: string;
	end: string;
	status: MaintenanceStatus;
	affectedServices: string[];
};
