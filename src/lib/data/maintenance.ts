import { statusSite } from '$lib/config/site';
import type { MaintenanceEvent, MaintenanceStatus } from '$lib/config/models';

export type { MaintenanceEvent, MaintenanceStatus };

export const maintenanceStatusLabels: Record<MaintenanceStatus, string> = statusSite.copy.maintenance.states;

export const demoMaintenanceEvents: MaintenanceEvent[] = statusSite.demo.maintenance.events;

export const defaultMaintenanceEvent = demoMaintenanceEvents[0];

export const maintenanceCalendarStart = statusSite.demo.maintenance.calendar.start;
export const maintenanceCalendarEnd = statusSite.demo.maintenance.calendar.end;
