const [slug, ...displayNameParts] = Bun.argv.slice(2);
const displayName = displayNameParts.join(' ').trim();
const origin = (process.env.PRODUCTCLIENT_ORIGIN ?? 'https://provision.productclient.com').replace(/\/$/, '');
const provisioningToken = process.env.TENANT_PROVISIONING_TOKEN;

if (!slug || !displayName || !provisioningToken) {
	console.error(
		'Usage: PRODUCTCLIENT_ORIGIN=https://provision.productclient.com TENANT_PROVISIONING_TOKEN=... bun run tenant:provision -- <slug> <display name>'
	);
	process.exit(1);
}

const response = await fetch(`${origin}/api/tenants`, {
	method: 'POST',
	headers: {
		authorization: `Bearer ${provisioningToken}`,
		'content-type': 'application/json'
	},
	body: JSON.stringify({ slug, displayName })
});

const body = await response.json().catch(() => null);

if (!response.ok) {
	console.error(`Tenant provisioning failed (${response.status})`, body);
	process.exit(1);
}

const statusUrl = `https://${body.tenant.slug}.status.productclient.com`;
console.log(`Tenant created: ${body.tenant.displayName} -> ${statusUrl}`);
