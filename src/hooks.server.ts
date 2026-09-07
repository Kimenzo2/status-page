import { error } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';
import { statusSite } from '$lib/config/site';
import { findTenant, resolveTenant, type TenantBindings } from '$lib/server/tenant';

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
		event.locals.tenant = tenant;
	}

	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%statusLang%', escapeAttribute(statusSite.locale))
	});
};
