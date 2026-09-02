# ProductClient status page — frontend system

## Scope and method

This describes how the status page is built, not whether the design is good.

- Route inspected: `http://127.0.0.1:5173/`
- Source inspected: `src/app.html`, `src/app.css`, `src/routes/+page.svelte`, `src/lib/components/StatusShell.svelte`, route pages, and `package.json`
- Runtime evidence: fetched SSR HTML and the successful Vite production build
- Browser-computed values, paint order, and live animation state were not available in this environment

## Frontend stack

Measured from `package.json` and the generated HTML:

- SvelteKit `^2.70.3` with Svelte `^5.56.1`
- Vite `^8.0.16` and TypeScript
- SSR-first SvelteKit pages with client hydration. The fetched HTML contains the complete status content before the generated SvelteKit client entry loads.
- Deployment uses `@sveltejs/adapter-auto`; production hosting is not selected yet, which is why the build prints the adapter-auto informational warning.
- No Tailwind, CSS-in-JS system, or external component library is present.

The interface is composed from one shared component, `StatusShell.svelte`, plus route-local Svelte markup and CSS. Global rules live in `src/app.css`; the overview route owns its page-specific styles in a Svelte-scoped `<style>` block.

## Token system

The global system has two layers.

Primitive ramps are authored in OKLCH:

- neutral surfaces: `--gray-950` through `--gray-700`
- warm type: `--warm-50` through `--warm-700`
- restrained slate state ramp: `--slate-200`, `--slate-300`, `--slate-900`
- monochrome black and white for shadows and image outlines

Semantic tokens consume those primitives:

- canvas, surface, muted surface, hover surface
- primary, soft, and faint ink
- structural lines and soft dividers
- positive and warning state surfaces, marks, borders, and foregrounds
- focus, selection, and image-outline roles

The status-state roles use the slate ramp rather than a brand-green UI accent. The remaining literal bright green is inside the ProductClient logo SVG and favicon asset (`#18e299`); it is asset artwork, not an interface token.

## Typography

Measured from `src/app.css` and the emitted HTML:

- `@fontsource-variable/geist/wght.css` serves Geist Variable as local `.woff2` files.
- The emitted `@font-face` declarations cover `font-weight: 100 900`, with `font-display: swap`.
- The root stack is `"Geist Variable", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.
- `font-optical-sizing: auto`, macOS smoothing, and font-aware link underlines are global.
- The semantic type scale is `12 / 13 / 14 / 15 / 16 / 17 / 27 / 30px`, with fluid display steps from `2.35rem` to `4rem` and a mobile display step from `2.2rem` to `3.2rem`.
- Body text is `16px` with unitless `1.5` line-height. Headings use tighter `1.1` or `1.02` line-heights and balance wrapping. Descriptions use `text-wrap: pretty`, `overflow-wrap: break-word`, and capped measures.
- The hero timestamp and uptime percentage use tabular numerals so changing values do not shift nearby layout.

## Layout and responsive behavior

Measured from the source:

- Header content: `min(100% - 48px, 1120px)`; on narrow screens it becomes `min(100% - 32px, 1120px)` and wraps the route tabs to a horizontal scroll row.
- Overview content: `min(100%, 900px)`.
- Empty route cards: `min(100%, 560px)`.
- The base document floor is `320px` wide.
- Responsive breakpoints are `47.5rem` for the shell and `38.75rem` for the overview content.
- The uptime history renders 90 bars on desktop and 45 columns across two rows on narrow screens; the narrow layout no longer removes the second half of the history.
- Navigation is route-based (`/`, `/incidents`, `/maintenance`, `/uptime`) rather than hash-based.

## Surfaces, structure, and depth

The page is intentionally flat and headless:

- header background and structural border are transparent/removed
- controls inherit the page background instead of receiving colored fills
- structural borders are `1px`
- service and route surfaces use the neutral surface ramp
- depth comes from two restrained shadow recipes rather than decorative effects
- the ProductClient logo receives a `1px` pure-white outline at 10% opacity in dark mode

Radii are local to the role: small controls use `8–10px`, service surfaces use `10–14px`, and circular status marks use `50%`.

## Motion and interaction

Measured from the source:

- route-tab color transitions: `150ms ease-out`
- subscribe and service-group press feedback: `transform: scale(0.96)` over `150ms ease-out`
- disclosure chevrons: `transform` over `150ms ease-out`
- hover rules are gated behind `@media (hover: hover)`
- `@media (prefers-reduced-motion: reduce)` disables transitions and animations and removes press transforms
- state changes retain text and icon cues; motion is not the only signal

There are no keyframe entrance sequences, gradients, blur layers, canvas effects, or animation libraries in the current frontend.

## Assets and delivery

- `src/lib/assets/productclient-logo.svg` is imported by SvelteKit and appears as an inline data URL in the fetched SSR HTML.
- `src/routes/favicon.ico/+server.ts` serves the favicon as SVG with a one-year immutable cache policy.
- No raster images, modern raster formats, or remote font hosts are used.

## States and boundaries

The live surface includes:

- active versus inactive route tabs
- subscribed versus unsubscribed header action
- expanded versus collapsed service group
- expanded versus collapsed service rows
- region/workflow context selection
- clear versus watch impact result styling
- reduced-motion and forced-colors branches

There is no loading or network-error UI yet because the current page uses static fixture data. The temporary `/__break` route is a stress harness and is not imported by production routes.

## What this method cannot establish

Without a scriptable browser, this report does not claim:

- which CSS rule wins after runtime cascade at each viewport
- computed pixel values after `rem` resolution
- actual paint order or visual overflow at 320px
- live animation playback
- OS-level dark-mode or browser-zoom behavior

Those require a browser inspection. The source and build evidence above are reproducible from the project itself.
