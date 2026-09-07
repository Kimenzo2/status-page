import { statusSite } from '$lib/config/site';
import type { Incident, IncidentStatus, IncidentUpdate } from '$lib/config/models';

export type { Incident, IncidentStatus, IncidentUpdate };

export const incidentStatusLabels: Record<IncidentStatus, string> = statusSite.copy.incidents.states;
export const incidentSymbols: Record<IncidentStatus, string> = statusSite.copy.incidents.symbols;

export const demoIncidents: Incident[] = statusSite.demo.incidents;

export function getActiveIncident(incidents: Incident[]) {
	return incidents
		.filter((incident) => incident.status !== 'resolved')
		.reduce<Incident | undefined>((latest, incident) => {
			if (!latest) return incident;

			const latestStartedAt = Date.parse(latest.startedAt);
			const incidentStartedAt = Date.parse(incident.startedAt);
			if (Number.isNaN(latestStartedAt)) return incident;
			if (Number.isNaN(incidentStartedAt)) return latest;

			return incidentStartedAt > latestStartedAt ? incident : latest;
		}, undefined);
}

export function getLatestIncidentUpdate(incident: Incident) {
	return [...incident.updates].sort(
		(first, second) => Date.parse(second.publishedAt) - Date.parse(first.publishedAt)
	)[0];
}
