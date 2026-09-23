/**
 * Re-export of the branding constants for application code.
 *
 * The definitions live in `config/branding.ts` so that the build configuration
 * can read them too (umi's config runs in Node, where the `@/` alias does not
 * resolve). Import from here — `@/config/branding` — in application code so the
 * two cannot drift.
 */
export {
  ATTRIBUTION,
  COLOR_PRIMARY_DEFAULT,
  COMPANY_NAME,
  PRODUCT_NAME,
  PRODUCT_NAME_LOWER,
  PRODUCT_TAGLINE,
  UPSTREAM_COPYRIGHT,
  UPSTREAM_LICENSE,
  UPSTREAM_NAME,
  UPSTREAM_URL
} from '../../config/branding';
