/**
 * Every link out of this product, in one place.
 *
 * These used to be hardcoded upstream URLs, which meant a customer clicking
 * "Report an issue" in the help menu landed on the upstream project's issue
 * tracker. That is not a cosmetic leak: it routes support traffic to someone
 * else's queue and tells the customer, at the moment they need help, that the
 * product they are running is somebody else's.
 *
 * Each entry can be overridden at build time so a deployment can point at its
 * own documentation site, portal or community without a code change:
 *
 *   ORIGINHUB_LINK_DOCUMENTATION=https://docs.example.com pnpm build
 *
 * The overrides are collected in Node (see `externalLinkOverrides` in
 * config/branding.ts) and injected as one static define. That shape is not
 * incidental: umi's `define` is a textual replacement of a *static*
 * `process.env.NAME` expression, so reading `process.env[key]` dynamically here
 * would compile to a browser bundle with no `process` at all.
 *
 * An empty value means "not configured", and consumers are expected to hide the
 * entry rather than render a link that goes nowhere — see `isConfigured`.
 * Source and issue links default to this fork's own repository, because that is
 * where this product's code and its bug reports belong.
 */

type LinkOverrides = Partial<Record<string, string>>;

const overrides: LinkOverrides = JSON.parse(
  process.env.ORIGINHUB_LINKS || '{}'
) as LinkOverrides;

const link = (key: string): string => overrides[key] || '';

const REPO = link('REPO') || 'https://github.com/NightThought/gpustack';

const externalLinks = {
  documentation: link('DOCUMENTATION'),
  github: link('GITHUB') || REPO,
  // The upstream community chat is not this product's community. Empty until
  // there is one; an invite to someone else's server is worse than none.
  discord: link('DISCORD'),
  site: link('SITE'),
  release: link('RELEASE') || `${REPO}/releases`,
  reportIssue: link('REPORT_ISSUE') || `${REPO}/issues/new/choose`,
  faq: link('FAQ'),
  imageSelector: link('IMAGE_SELECTOR'),
  resetPassword: link('RESET_PASSWORD')
};

export type ExternalLinkKey = keyof typeof externalLinks;

/**
 * Whether a link is configured. Menu builders use this to drop an entry instead
 * of rendering an anchor with an empty href, which navigates to the current page
 * and reads as a broken button rather than as a missing configuration.
 */
export const isConfigured = (key: ExternalLinkKey): boolean =>
  Boolean(externalLinks[key]);

/**
 * A deep link into the documentation, given the path only —
 * `docLink('installation/requirements/#nvidia-gpu')`.
 *
 * This exists because more than a dozen components had the upstream docs host
 * pasted into their own `link:` fields, so setting `DOCUMENTATION` repointed the
 * help menu while every hardware-requirements link still went to
 * docs.gpustack.ai. Half a configuration is worse than none, because it looks
 * done.
 *
 * Unlike the menu links, the result is never empty: these pages document GPU
 * driver and NPU SDK requirements, which are facts about the software this
 * product is built from, and dropping the link would delete useful information
 * rather than remove an upstream brand. With no `DOCUMENTATION` configured the
 * upstream host is used as the fallback, which keeps the provenance visible in
 * the URL; configuring one replaces every occurrence at once.
 */
const UPSTREAM_DOCS_BASE = 'https://docs.gpustack.ai/latest';

export const docLink = (docPath: string): string => {
  const base = externalLinks.documentation || UPSTREAM_DOCS_BASE;
  return `${base.replace(/\/+$/, '')}/${docPath.replace(/^\/+/, '')}`;
};

export default externalLinks;

/**
 * Deep links into the documentation, built from `documentation` — so they are
 * empty when no documentation site is configured, and callers that render them
 * as links should check first.
 */
export const externalRefer = {
  audioPermission: externalLinks.documentation
    ? `${externalLinks.documentation}latest/user-guide/playground/audio/#provide-audio-file`
    : ''
};
