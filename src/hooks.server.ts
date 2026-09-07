import { error } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';
import { statusSite } from '$lib/config/site';
import { isReservedAppSegment, isSlugShaped } from '$lib/tenantRouting';
import { findTenant, resolveTenant, type TenantBindings } from '$lib/server/tenant';

export const handle: Handle = async ({ event, resolve }) => {
	const platform = event.platform as (App.Platform & { env?: TenantBindings }) | undefined;
	const platformEnv = platform?.env;
	const tenantDomain = platformEnv?.PUBLIC_STATUS_TENANT_DOMAIN ?? 'status.productclient.com';
	const tenant = resolveTenant(event.url.hostname, tenantDomain);

	if (tenant.isTenantSubdomain) {
		if (!platformEnv?.DB) {
			throw error(503, 'Tenant storage is not configured');
		}

		const record = await findTenant(platformEnv.DB, tenant.slug!);
		if (!record || record.status !== 'active') {
			throw error(404, 'Status page not found');
		}

		event.locals.tenant = { ...tenant, record };
	} else {
		// Path-based tenants: the first path segment names the tenant
		// (status.productclient.com/faith/uptime). Resolution is server-side
		// from the original URL — the reroute hook only remaps routing, so the
		// tenant is never chosen from untrusted client state. Reserved app
		// segments (uptime, maintenance, ...) keep serving the neutral site.
		const segment = event.url.pathname.split('/')[1] ?? '';
		if (segment && isSlugShaped(segment) && !isReservedAppSegment(segment)) {
			if (!platformEnv?.DB) {
				throw error(503, 'Tenant storage is not configured');
			}

			const record = await findTenant(platformEnv.DB, segment);
			if (!record || record.status !== 'active') {
				throw error(404, 'Status page not found');
			}

			event.locals.tenant = {
				...tenant,
				slug: record.slug,
				record,
				basePath: `/${record.slug}`
			};

			return resolve(event, {
				transformPageChunk: ({ html }) =>
					html.replace('%statusLang%', escapeAttribute(statusSite.locale))
			});
		}

		event.locals.tenant = tenant;
	}

	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%statusLang%', escapeAttribute(statusSite.locale))
	});
};

function escapeAttribute(value: string) {
	return value.replace(/[&<>'"]/g, (character) => {
		const entities: Record<string, string> = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			"'": '&#39;',
			'"': '&quot;'
		};

		return entities[character];
	});
}
