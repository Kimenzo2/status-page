# Cloudflare deployment

This Status Page is configured as a SvelteKit Worker with Cloudflare Static Assets and a shared D1 tenant registry. It is intentionally a separate Worker from the Documentation Starter Kit.

## Hosting model

```text
productclient.com
        -> ProductClient Mother App

*.productclient.com
        -> Documentation Worker

status.productclient.com
        -> Status Page Worker / neutral starter tenant

status.productclient.com/{slug}[/uptime|/incidents|/maintenance]
        -> Status Page Worker (path-based tenants, live)
        -> shared productclient-tenants D1 registry

productclient-status-page.<account>.workers.dev
        -> Status Page Worker (current deployment)
        -> shared productclient-tenants D1 registry
```

The Documentation Worker already owns `*.productclient.com/*`. This Worker claims the more-specific exact host `status.productclient.com` for the neutral starter tenant, with an explicit `status.productclient.com/*` route so the documentation wildcard cannot intercept its page routes. The tenant resolver is also prepared for future `*.status.productclient.com` customer hostnames, but a nested wildcard route is not enabled: the current Cloudflare zone has only Universal SSL, which does not cover a second-level wildcard such as `*.status.productclient.com`. Customer hostnames should be registered individually through Cloudflare for SaaS / Custom Hostnames until a delegated status zone or deeper certificate strategy is in place.

## Path-based tenants (primary, live)

Tenants are served from first path segments on the neutral host itself:
`status.productclient.com/faith` renders Faith's status page and
`status.productclient.com/faith/uptime` renders the tenant's uptime view. This
needs no second-level wildcard or certificate coverage because the host is
already covered by Universal SSL.

- `src/hooks.server.ts` resolves the tenant server-side from the original URL
  and 404s unknown or suspended slugs; the neutral app routes (`/uptime`,
  `/incidents`, `/maintenance`, static assets) keep serving the ProductClient
  status site untouched.
- `src/hooks.ts` (the shared `reroute` hook, SvelteKit's equivalent of the
  Mintlify subpath proxy) strips the tenant segment before route matching, so
  the browser URL keeps the prefix while the existing root routes render.
- Shell tabs and the brand link are prefixed with the tenant base so
  navigation stays inside the tenant.

A tenant slug can never shadow an app route: reserved first segments are
checked first and customers cannot claim them (they are reserved slugs in
Postgres).

The Worker resolves the tenant server-side from the hostname. It never accepts a tenant selector from a query parameter or client-side state. The current starter shares the source-editable status content across tenants while using D1 for tenant identity. Live monitoring and customer-editable content are separate integrations and should be added behind authenticated APIs/webhooks later.

## D1 registry

This Worker intentionally reuses the Documentation Starter Kit’s existing `productclient-tenants` database:

- database: `productclient-tenants`
- binding: `DB`
- migration: `migrations/0001_create_tenants.sql`

The migration is idempotent and shared. It does not create a second registry. If the migration has already been applied by the Documentation Worker, Wrangler reports it as already applied for this database.

To inspect or apply migrations from this repository:

```powershell
cd "C:\Users\admin\Downloads\Status Page"
bunx wrangler d1 migrations list productclient-tenants --remote
bunx wrangler d1 migrations apply productclient-tenants --remote
```

## Provisioning a tenant

Provisioning remains centralized on the Documentation Worker’s reserved host so both public surfaces share one tenant registry:

```http
POST https://provision.productclient.com/api/tenants
Authorization: Bearer <TENANT_PROVISIONING_TOKEN>
Content-Type: application/json

{
  "slug": "acme",
  "displayName": "Acme"
}
```

The account service should make that call after authentication. For an operator-side command, keep the token only in the current shell:

```powershell
$env:PRODUCTCLIENT_ORIGIN = "https://provision.productclient.com"
$env:TENANT_PROVISIONING_TOKEN = "<the value stored in the provisioning Worker secret>"
bun run tenant:provision -- acme "Acme"
Remove-Item Env:PRODUCTCLIENT_ORIGIN, Env:TENANT_PROVISIONING_TOKEN -ErrorAction SilentlyContinue
```

The private token must never be sent to the browser, committed, or placed in `wrangler.jsonc`.

## Cloudflare setup

1. Keep `productclient.com` in the Cloudflare account identified by the account ID in `wrangler.jsonc`.
2. The exact `status.productclient.com` host is configured as a Worker Custom Domain, with a more-specific `status.productclient.com/*` route to keep the existing Documentation wildcard from intercepting this Worker. Do not add a nested `*.status` DNS record or route until the certificate/hostname strategy is selected. The existing Documentation wildcard must remain untouched.
3. Create or reuse an API token with the minimum Workers deployment and D1 permissions required by the deployment process. Rotate any token that has been pasted into chat.
4. For local Wrangler authentication, use `bunx wrangler login`. For CI, add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as GitHub Actions repository secrets.
5. Deploy with:

```powershell
bun run cf:deploy
```

The checked-in workflow deploys on pushes to `main` and can also be started manually.

## Future custom domains

Custom customer-owned domains are compatible with this architecture. They should eventually be attached to this Worker through Cloudflare for SaaS / Custom Hostnames and mapped to a tenant in D1. Do not create one Worker route per customer or enable a nested wildcard without certificate coverage. The next production routing choices are: enable Advanced Certificate Manager and explicitly cover `*.status.productclient.com`, use a separately delegated status zone, or put hostname dispatch in a shared edge Worker.

## Verification

```powershell
bun run check
bun run build
bunx wrangler deploy --dry-run
```

The `workers.dev` URL remains a smoke-test target. The exact starter host is advertised only after the Custom Domain has been deployed and its DNS/certificate status is active. A namespaced customer host is not advertised until its hostname, certificate, route, and matching active slug all exist in the shared D1 registry.
