# Status Page starter kit

A small, public-facing SvelteKit status page with editable demo data. The routes are views of the shared model, so one change propagates across the overview, incidents, maintenance, and uptime pages.

## Edit the starter content

Start with `src/lib/config/site.ts`. It is the single source for the public starter configuration:

- identity: company name, logo, locale, and timezone
- navigation and public UI copy
- service journeys and their descriptions
- theme tokens: colors, font stack, type scale, radii, content width, and calendar density
- `copy.emptyStates`: Reicon illustration source, title, summary, tone, and optional action for each first-provisioned empty surface
- `demo`: editable fixture state for service status, verification time, uptime history, incidents, and maintenance

The modules in `src/lib/data/` are typed adapters and selectors over that configuration. They should not contain customer-facing fixture records. In production, replace the `demo` adapters with monitoring, incident-management, and webhook data sources rather than putting live telemetry in site configuration.

The starter identity is intentionally neutral and can be overridden with public environment variables:

```env
PUBLIC_STATUS_NAME=Example Company
PUBLIC_STATUS_LOGO_URL=/starter-mark.svg
PUBLIC_STATUS_LOCALE=en-US
PUBLIC_STATUS_TIMEZONE=Africa/Nairobi
```

Copy and source-editable demo content stay in `site.ts` so one change propagates across every route without searching through route markup. The data modules keep formatting, grouping, and selection logic separate from the editable content.

Empty states use the localized Reicon SVG illustrations in `static/illustrations/reicon/`. They are decorative and rendered directly in the surface that owns the empty content; they are not nested cards. The standard illustration scale is 64px on larger screens, 48px for compact states, and 40px for compact states on narrow screens.

## Develop

```sh
bun install
bun run dev -- --open
```

## Verify

```sh
bun run check
bun run build
```

The project uses SvelteKit with Bun and TypeScript. It intentionally does not include an admin/editor screen: this is a source-editable public starter kit, similar to the way documentation starter kits expose content in configuration and data files.

## Cloudflare tenant hosting

The Status Page is deployable as a Cloudflare Worker with Static Assets. It uses the shared `productclient-tenants` D1 registry. `status.productclient.com` is the neutral starter tenant; future customer hostnames are resolved through the same Worker and tenant registry. The Documentation Worker’s `*.productclient.com` wildcard remains separate, with the exact status host taking precedence. See `CLOUDFLARE_DEPLOYMENT.md` for DNS, provisioning, CI, D1, and future custom-domain routing.
