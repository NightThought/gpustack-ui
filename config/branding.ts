/**
 * Single source of truth for product branding.
 *
 * This file lives under `config/` rather than `src/config/` because the build
 * configuration needs it too: `config/config.ts` sets the document title from
 * here, and umi's config runs in Node at build time where the `@/` alias does
 * not resolve. `src/config/branding.ts` re-exports it for application code.
 *
 * Keeping every user-visible brand string in one place is what makes an upstream
 * merge survivable. After syncing from upstream, a conflict in this file is
 * expected and is resolved once; a rebrand scattered across a hundred files is
 * not resolved at all, it is silently lost.
 *
 * Deliberately **not** here — these keep their upstream spelling on purpose,
 * because they are compatibility surfaces rather than branding:
 *
 * - `GPUSTACK_API_BASE_URL` and its value `'v2'` (src/config/settings.ts). The
 *   value is the backend's real API prefix; renaming it breaks every request.
 * - `getGPUStackPlugin`, `GPUStackPluginManager` and the `GPUSTACK_*` constants.
 *   Internal identifiers — renaming them touches dozens of files, produces no
 *   brand benefit, and conflicts on every upstream merge.
 * - Anything under `src/assets/logo/` and `src/assets/providers-logo/`. Those
 *   are other companies' marks, reproduced to identify compatible hardware and
 *   model families. A rebrand must not touch them.
 */

/** Display name: the document title, menus, and any prose that names the product. */
export const PRODUCT_NAME = 'OriginHub';

/** Lowercase slug, for identifiers and file names that need one. */
export const PRODUCT_NAME_LOWER = 'originhub';

/** One-line description, for meta tags and the login page. */
export const PRODUCT_TAGLINE =
  'AI infrastructure and LLM inference serving platform';

/**
 * The legal entity named in the footer copyright line.
 *
 * Defaults to the product name rather than to a company, because guessing a
 * legal entity name is the kind of error that ends up in a contract: set
 * `ORIGINHUB_COMPANY` at build time to the name that should appear next to the
 * © symbol. Upstream hardcoded a vendor name here, which is exactly what a
 * rebrand must not inherit.
 *
 * Read through `define` (see config/config.ts), so the same expression works in
 * the Node build config and in the browser bundle.
 */
export const COMPANY_NAME: string =
  process.env.ORIGINHUB_COMPANY || PRODUCT_NAME;

/**
 * Default primary colour.
 *
 * Left at the upstream value on purpose. The colour is an admin-settable
 * runtime setting (src/atoms/settings.ts, and see the note in
 * src/atoms/utils/index.ts: "colorPrimary is an enterprise-wide branding
 * setting"), so a deployment can already choose its own. Inventing a brand
 * colour here would be a guess recorded as a decision; set it deliberately once
 * the brand guidelines exist, or let the admin setting do the work.
 */
export const COLOR_PRIMARY_DEFAULT = '#007BFF';

/**
 * Upstream attribution — do not remove.
 *
 * This project is a derivative work of GPUStack under the Apache License,
 * Version 2.0, and §4(c) requires the original attribution to survive. Keeping
 * it next to the brand names is deliberate: the easiest compliance mistake in a
 * rebrand is deleting the upstream copyright line because the name changed.
 */
export const UPSTREAM_NAME = 'GPUStack';
export const UPSTREAM_URL = 'https://github.com/gpustack/gpustack-ui';
export const UPSTREAM_LICENSE = 'Apache-2.0';
/**
 * The year range is `2024`, not `2024-2026`: this repository's LICENSE carries
 * `Copyright (c) 2024 The GPUStack authors`, and an attribution that cites a
 * wider range than the licence grants is its own small inaccuracy. Match the
 * file the notice is vouching for.
 */
export const UPSTREAM_COPYRIGHT = 'Copyright (c) 2024 The GPUStack authors';

/**
 * The acknowledgement string for user-facing surfaces — an About dialog, the
 * version menu, a page footer. One constant so the wording cannot drift between
 * surfaces or be dropped from one of them.
 */
export const ATTRIBUTION = `${PRODUCT_NAME} is built on the open-source ${UPSTREAM_NAME} project, licensed under the ${UPSTREAM_LICENSE} License. ${UPSTREAM_COPYRIGHT}.`;

/**
 * External-link overrides, collected here in Node and injected into the bundle
 * as a single static define (see `config/config.ts` and
 * `src/constants/external-links.ts`).
 *
 * The indirection exists because umi's `define` replaces a *static*
 * `process.env.NAME` expression textually. Application code therefore cannot
 * read `process.env[key]` dynamically — there is no `process` in a browser
 * bundle — so the dynamic reading happens here, where it is legitimate, and the
 * result crosses over as one JSON literal.
 *
 * Every `ORIGINHUB_LINK_*` variable is picked up; only the ones actually set are
 * emitted, so the bundle carries no empty noise.
 */
export function externalLinkOverrides(): Record<string, string> {
  const prefix = 'ORIGINHUB_LINK_';
  const out: Record<string, string> = {};
  // Annotated explicitly rather than relying on @types/node to type
  // `process.env`: the narrowing below then holds under any version of those
  // types, and an empty-string override is correctly treated as unset.
  const entries = Object.entries(
    process.env as Record<string, string | undefined>
  );
  for (const [key, value] of entries) {
    if (key.startsWith(prefix) && typeof value === 'string' && value) {
      out[key.slice(prefix.length)] = value;
    }
  }
  return out;
}
