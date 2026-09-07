import type { Reroute } from '@sveltejs/kit';
import { stripFirstSegment } from '$lib/tenantRouting';

/**
 * Path-based tenant routing: the browser URL keeps the tenant prefix
 * (status.productclient.com/faith/uptime) while route matching sees the
 * internal path (/uptime). The tenant record itself is resolved server-side
 * in src/hooks.server.ts from the original URL; this reroute only decides
 * which route renders, so it stays pure and runs on the client too.
 */
export const reroute: Reroute = ({ url }) => stripFirstSegment(url.pathname);
