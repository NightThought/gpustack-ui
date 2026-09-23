/**
 * Brand image assets — the one place that decides what represents the product.
 *
 * ## Why there is no default logo
 *
 * The bundled artwork is the upstream GPUStack wordmark. It used to be what the
 * console rendered by default, which made every login page an advertisement for
 * a different product. Until a real brand kit exists the default is therefore
 * **text**: `BrandWordmark` renders the product name, `BrandMark` renders its
 * initials. That is a placeholder, and it is visibly one — which is the point. A
 * generated stand-in would ship something that looks final and reads as approved.
 *
 * ## Overriding it
 *
 *   Build time   ORIGINHUB_LOGO=/brand/wordmark.png \
 *                ORIGINHUB_MINI_LOGO=/brand/mark.png pnpm build
 *
 *   Deploy time  replace `public/static/favicon.png` — the favicon is read from
 *                `public/`, not from the bundle, so no rebuild is needed. See
 *                `favicons` in config/config.ts, and `ORIGINHUB_FAVICON` to
 *                rename the reference.
 *
 * An override is a URL the browser resolves: an absolute https:// URL, or a path
 * served from `public/` such as `/brand/wordmark.png`. It is not run through the
 * bundler, so the file has to be uploaded as well as configured.
 *
 * ## The two naming styles below are deliberate
 *
 * `*_OVERRIDE` is empty when nothing was configured, so callers can ask "did the
 * deployment provide artwork?" without a second flag. `PRODUCT_*` always
 * resolves to a URL, because one consumer needs that: the login kit handed to the
 * enterprise plugin declares `formLogoUrl: string` and renders it as an `<img
 * src>`, so handing it an empty string would break that build's login page. Text
 * fallbacks are for surfaces this repository renders itself.
 *
 * The bundled files keep their `gpustack-*` filenames. They are the upstream
 * artwork, still shipped because deleting licensed material is not a rebrand and
 * because they are the fallback for that plugin contract; what users see is the
 * picture, not the filename.
 */

import BundledWordmark from '@/assets/images/gpustack-logo.png';
import BundledMark from '@/assets/images/small-logo-200x200.png';

/** The shipped upstream wordmark. Not rendered by default; see above. */
export const BUNDLED_WORDMARK: string = BundledWordmark;

/** The shipped upstream square mark. Not rendered by default; see above. */
export const BUNDLED_MARK: string = BundledMark;

/** The configured wordmark URL, or `''`. */
export const WORDMARK_OVERRIDE: string = process.env.ORIGINHUB_LOGO || '';

/** The configured square-mark URL, or `''`. */
export const MARK_OVERRIDE: string = process.env.ORIGINHUB_MINI_LOGO || '';

/**
 * A wordmark URL that is never empty, for consumers whose contract requires one
 * (the enterprise login kit). Prefer `WORDMARK_OVERRIDE` plus a text fallback
 * everywhere else.
 */
export const PRODUCT_WORDMARK: string = WORDMARK_OVERRIDE || BUNDLED_WORDMARK;

/** A square-mark URL that is never empty. See `PRODUCT_WORDMARK`. */
export const PRODUCT_MARK: string = MARK_OVERRIDE || BUNDLED_MARK;

/**
 * Whether this deployment supplied its own artwork. Useful for an audit line —
 * "branding not yet configured" — and for tests; not for hiding a picture.
 */
export const HAS_BRAND_ASSETS: boolean = Boolean(
  WORDMARK_OVERRIDE || MARK_OVERRIDE
);
