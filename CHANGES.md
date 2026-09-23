# Changes from upstream

This console is a derivative work of the GPUStack web console (https://github.com/gpustack/gpustack-ui), which is licensed under the Apache License, Version 2.0. Apache-2.0 §4(b) requires that recipients be shown what changed; this file is that notice. It is not a changelog of features — it is a record of the delta this fork maintains, so that an upstream merge and a compliance review both have a fixed reference point.

## Baseline

    fork remote:    https://github.com/NightThought/gpustack-ui
    HEAD at the
    time of the
    rebrand commit: 729003b1610244f576899b37813ba88f876a0494
                    "fix(llmodels): tighten YAML refusal and scaling window activation"

`main`, `origin/main` and `HEAD` all pointed at that commit when the work below started, so `git diff` in this repository against the rebrand commit _is_ the §4(b) modification list. The upstream project's own release that the baseline corresponds to was not determined locally and is not asserted here.

To reproduce the full diff of this fork against its baseline:

    git log --oneline 729003b1..HEAD
    git diff 729003b1..HEAD

## Branding changes

All brand strings now resolve through one module, so that an upstream merge conflicts in exactly one place instead of silently reverting a hundred files.

- **Added `config/branding.ts`** — single source of truth: `PRODUCT_NAME` (`OriginHub`), `PRODUCT_NAME_LOWER`, `PRODUCT_TAGLINE`, `COMPANY_NAME`, `COLOR_PRIMARY_DEFAULT`, the upstream attribution constants, and `externalLinkOverrides()`. It lives under `config/` because the umi build config needs it and runs in Node, where the `@/` alias does not resolve.
- **Added `src/config/branding.ts`** — re-export for application code, so the build config and the bundle cannot drift apart.
- **`config/config.ts`** — document `title` now comes from `PRODUCT_NAME`. This is the only place the title is set: the repository has no `index.html` or `document.ejs`, umi generates the document from this value. Also added the `ORIGINHUB_LINKS` and `ORIGINHUB_COMPANY` defines (see below).
- **`src/constants/external-links.ts`** — the ten outbound links were all hardcoded to upstream properties. Most consequentially `reportIssue`, wired to the help menu, sent this product's users into the upstream issue tracker. Now: source and issue links default to this fork's repository; documentation, site, Discord, FAQ, image-selector and reset-password default to **empty** rather than to someone else's URL, and every one of them can be overridden at build time with `ORIGINHUB_LINK_<KEY>`. Added `isConfigured(key)` so menus drop an entry instead of rendering an anchor with an empty `href`.
- **`src/constants/external-links.ts` — `docLink(path)`**, and 13 call sites converted to it. Thirteen more upstream docs URLs lived _outside_ that file: nine hardware-requirement links in `src/pages/cluster-management/components/support-gpus.tsx` plus four in the model-import, YAML-import and cluster-config pages. They bypassed the configuration entirely, so setting `DOCUMENTATION` repointed the help menu while every one of those links still went to `docs.gpustack.ai` — half a configuration, which is worse than none because it looks done. They now pass a path and resolve through one base. Unlike the menu links these never return an empty string: they point at driver and NPU SDK requirements, which are facts about the software this fork is built from, so the fallback is the upstream host (provenance visible) rather than a deleted link.
- **`src/config/logos.ts` and `src/components/brand-logo/`** — added. `gpustack-logo.png` (the 432×108 upstream wordmark) and `small-logo-200x200.png` were imported directly by five surfaces: the login page, the login form, the sidebar, the version/about dialog and the default MaaS-provider icon. So every deployment the fork produced showed another company's wordmark on its login page, which is the single most visible brand surface in the product.

  All five now render `BrandWordmark` / `BrandMark`, which show an image when the deployment configured one (`ORIGINHUB_LOGO` / `ORIGINHUB_MINI_LOGO`) and the product name, or its initials, when it did not. **The default is text, not the bundled picture.** That is a deliberate choice about what an unfinished brand should look like: generated artwork would ship something that looks final and reads as approved, whereas the product's own name is visibly a placeholder and still true. The text is derived from `PRODUCT_NAME`, so it cannot drift from the brand source of truth, and the square mark computes its initials, so it follows a rename.

  The bundled files stay in the repository and stay reachable, because deleting licensed material is not rebranding and because one consumer needs a URL: the enterprise login kit declares `formLogoUrl: string` and renders it as an `<img src>`, so that path keeps `PRODUCT_WORDMARK` (never empty) while everything this repository renders itself prefers `WORDMARK_OVERRIDE` (empty when unconfigured) plus the text fallback.

  `public/static/favicon.png` is served from `public/`, so it can be replaced without a rebuild; `ORIGINHUB_FAVICON` additionally lets the reference be renamed.

- **The `ORIGINHUB_*` define values are raw values, and that is load-bearing.** umi stringifies every `define` value itself before handing it to webpack (`@umijs/bundler-webpack/dist/config/definePlugin.js`: `define[key] = JSON.stringify(userConfig.define[key])`). Wrapping them here as well makes the value arrive with its quotes attached — the footer renders `"Acme Ltd"`, and an unset value becomes the two-character `""` instead of falling back to the product name. This is recorded because it happened: a review pass reported the missing stringify as a defect, the suggestion was applied, a build with `ORIGINHUB_COMPANY="Acme Ltd"` produced `o='"Acme Ltd"'` in the bundle, and the change was reverted. The links blob is the one deliberate exception, because `external-links.ts` parses it with `JSON.parse` at runtime. The guard now asserts both halves so the next person does not have to rediscover it.
- **`src/pages/login/components/local-user-form.tsx`, `src/pages/playground/components/audio-input.tsx`** — two consumers of the now-empty-on-unconfigured links, found in review and fixed: the login form's "Forgot password" rendered `href=""` (navigating to the current page) and the microphone-permission hint rendered a link to nothing. Both now hide the link when its target is unconfigured, which is the contract the rest of this change already followed in the footer and the help menus. They are worth naming because they were _not_ in the original change set: making a value empty is a change to every consumer, and only the consumers that were already being edited got noticed the first time.
- **`src/layouts/github-star.tsx`** — the widget fetched its star count from a hardcoded `gpustack/gpustack` slug while the button itself linked through `externalLinks.github`. Repointing that link without touching this would have advertised the upstream project's popularity as this product's own, so the count is now derived from the same value the link uses, the cache key is per-repository (a cached upstream count cannot survive a change of link), and the widget renders nothing when no repository can be parsed.
- **`src/components/version-info/index.tsx`** — dropped its local copy of the wordmark import; `useLogo()` already resolves it.
- **`src/layouts/rightRender.tsx`, `src/layouts/extraRender.tsx`** — help menu labels come from `PRODUCT_NAME`; entries whose link is unconfigured are filtered out.
- **`src/components/footer/index.tsx`** — the copyright line rendered a vendor company name taken from the `settings.company` translation key. It now renders `COMPANY_NAME`, which defaults to the product name and is set from `ORIGINHUB_COMPANY` at build time; the surrounding link is gated on `isConfigured('site')` so an unconfigured deployment shows text, not a dead anchor. The Apache-2.0 attribution string is rendered in the footer, which is the one surface every console user passes through.

  **Removing that line was considered and rejected**, and the reasoning is worth recording because the opposite decision would also have been defensible. Apache-2.0 does not require a visible notice: §4 puts the obligation on retaining notices in the source and in the distributed material — the LICENSE, the NOTICE and the copyright headers — none of which are a UI element. So deleting the footer line would not have breached the licence. It is kept because of what it now says: it names **this product**, not the upstream project. The line it replaced printed the upstream vendor's company name, which is why it had to change at all; having changed it, the remaining value is that it is a visible, honest statement of provenance at no cost, and the cheapest answer available if anyone later asks which code this console is.

- **`src/pages/billing/index.tsx`, `src/pages/organizations/index.tsx`** — the two upsell call-to-action buttons pointed at the upstream commercial page. They now point at `externalLinks.site` and are hidden when no site is configured, instead of advertising a product this build does not sell.
- **Locale files** (`src/locales/{en-US,ja-JP,ru-RU,zh-CN,tr-TR}/*.ts`, 45 files) — product-name substitution in user-facing prose, plus rewording where substitution would have produced a false statement:
  - "Follows the image versions GPUStack publishes…" → "Follows the published image versions…", because this fork publishes nothing.
  - "Available in GPUStack Enterprise" → "Not included in this build"; "Billing is an Enterprise feature" → "Billing is not enabled in the console yet". Renaming an edition that does not exist in this product would claim a commercial tier this repository does not ship.
  - Equivalent treatment in zh-CN ("跟随 GPUStack 发布的…" → "跟随已发布的…", "计费是企业版功能" → "计费页面尚未接入控制台"), ja-JP, ru-RU and tr-TR ("GPUStack'in yayınladığı" → "platformun yayınladığı").

## Guard

**Added `scripts/check-brand.cjs`** (`npm run check:brand`), wired into `.husky/pre-commit` and into a `brand` CI job. It has no dependencies and does not need `node_modules`, so it runs before the install job and still works on a branch whose dependencies are broken.

It checks both directions, because a fork has two ways to fail: the brand leaking back in, and the attribution being cleaned out. Specifically — the Apache text and the upstream copyright line still present in `LICENSE`, `NOTICE`, `README.md` and `config/branding.ts`; `NOTICE` still describing this as a derivative work and still recording the open `@gpustack/core-ui` question; the compatibility surfaces (`GPUSTACK_API_BASE_URL`, `getGPUStackPlugin`) still present; `PRODUCT_NAME` defined exactly once and no hardcoded `"OriginHub"` in any component; each help link not defaulting to an upstream property; upstream `docs.gpustack.ai` occurrences pinned to a recorded allow-list so a new hand-written URL fails; no upstream Discord invite; third-party mark directories unchanged in file count; no component importing a bundled brand image directly.

Verified to be able to fail, which a guard must demonstrate rather than claim: a throwaway `src/pages/zz-brand-probe.ts` containing a hardcoded product name, a hand-written docs URL and an upstream Discord invite was detected by all three relevant checks — including in a file not yet known to git — then removed. The attribution-side checks are plain `includes()` tests against the exact upstream copyright line, so deleting that line fails them by construction; that direction was reasoned rather than exercised, because it would have meant editing a legal file to break it.

**`.github/workflows/ci.yml`** — beyond the new job, `trigger-backend` dispatched `ui-built` to `gpustack/gpustack`, i.e. this fork's build pipeline was wired to wake the upstream repository. Retargeted to `NightThought/gpustack`, whose `pack.yaml` is the workflow that actually listens for `ui-built`.

## Deliberately **not** changed

Renaming these would break compatibility for zero brand benefit. If you are reviewing this diff looking for missed renames, this is the list of misses that are decisions.

- `GPUSTACK_API_BASE_URL` and its value `'v2'` (`src/config/settings.ts`) — the value is the backend's real API prefix.
- `getGPUStackPlugin`, `GPUStackPluginManager` and the `GPUSTACK_*` window constants — internal identifiers between the console and the gateway plugin surface; renaming touches hundreds of files and conflicts on every merge.
- `X-GPUStack-*` request/response headers — the wire protocol with the backend, which is itself unchanged.
- Anything under `src/assets/logo/` and `src/assets/providers-logo/` — those are other companies' trademarks, reproduced to identify compatible hardware. They are not this project's brand and must survive a rebrand untouched.
- `COLOR_PRIMARY_DEFAULT` — left at the upstream value, because `colorPrimary` is already an admin-settable runtime setting. Inventing a hex code here would record a guess as if it were a brand decision.
- The npm package name `@gpustack/core-ui` and its import sites — see below.
- `package.json` `author: "gpustack"` and the absence of a `license` field — the manifest is not shipped to users, naming a legal entity here would be a guess, and declaring Apache-2.0 on a bundle that includes a component with no published grant would overclaim. See `NOTICE`.
- The repository directory name `gpustack-ui` and the `origin` URL — renaming a git remote is a coordination event, not a search-and-replace.

## Known remaining brand references

- Five locale strings (`*/resources.ts`, "installation requirements" help text) still deep-link to `https://docs.gpustack.ai/latest/installation/installation-requirements/`. The 13 component-side equivalents were centralised into `docLink()`; these five are inside translated HTML, so they stay as text and the guard pins their count to exactly one per locale. They are left pointing upstream because that page documents hardware/driver requirements that are factually about the software this fork is built from, and no substitute document exists yet — silently dropping the link would remove real information, and leaving an OriginHub sentence pointing at a GPUStack URL is at least honest about provenance. Resolve by publishing a forked docs site; then these five are the remaining edits, and tightening the allow-list in `scripts/check-brand.cjs` will keep them from growing back.
- The bundled brand images (`src/assets/images/gpustack-logo.png`, `small-logo-200x200.png`, `public/static/favicon.png`, `public/favicon.ico`) are still the upstream artwork and are still shipped. Nothing renders them by default any more — the console shows text until a brand kit arrives — so the remaining user-visible brand surface is the **browser favicon**, plus the bundled files themselves for anyone who inspects the build. Replacing the favicon needs no rebuild: drop a file on `public/static/favicon.png` at deploy time.
- `@gpustack/core-ui` renders branding and image references from inside the package (e.g. `AddWorkerDockerNotes`, consumed as data in `src/pages/cluster-management/components/`), and it carries a `Footer` component that links to `https://gpustack.ai` — not rendered by this console, which has its own footer, but present for whoever adopts it next. Fixing either means a change in that repository, not this one; see `NOTICE` for the licence question attached to it.

  Recorded here because it was the single most surprising finding of this work: that repository is not a third party's. `package.json` names it as a dependency, so it reads like an external component, but the package is built and published from this organisation's own repositories — its CI publishes `@gpustack/core-ui` with npm trusted publishing on a tag push, and then opens the dependency-bump PR against `gpustack/gpustack-ui`. The missing licence field is therefore a metadata gap in our own release pipeline rather than a permission to be obtained, and closing it is one edit plus one publish.

  Checked rather than assumed, because the first assumption was wrong: 1.1.20 is the version the registry serves as `latest` and it was published without the field — `npm view @gpustack/core-ui license` is empty, and listing the tarball shows no LICENSE file in it, only README and package.json alongside `dist`. So "latest" still tells a consumer nothing about terms, and the fix now has to ship as the next version rather than as 1.1.20.

- `src/pages/llmodels/hooks/index.ts` matches the literal `"The model file path you specified does not exist on the GPUStack server. It's recommended"` to decide whether to swap in a localised message. That string is a comparison against text produced by the backend, not copy this product writes, so renaming it here would break the match and change nothing visible. Note that the backend today emits `Model path '<path>' does not exist on the server node.` (`gpustack/scheduler/calculator.py`), which this prefix does not match: the branch appears already dead as a result of upstream drift. Flagged, not "fixed" — repairing it is a behaviour change that needs a decision about which side owns the message.
- Developer-facing prose in comments and docstrings still says GPUStack, in both repositories. A reader of the source is entitled to know what the code came from; that is what the attribution is for. User-visible strings are the surface that had to change.

## Verification status

Read this before trusting the statements above.

- **Built, type-checked and checked a second time with dependencies installed.** `pnpm install --frozen-lockfile` (4m27s), then:

  | Check | Result |
  | --- | --- |
  | `pnpm run check:locales` | `All keys are consistent!` — the project's own check, not a substitute for it |
  | `pnpm exec tsc -p tsconfig.json --noEmit` | 69 error lines, none in a file this change touched (`brand-logo`, `config/logos`, `config/branding`, `external-links`, `use-logo`, login, version-info, provider-logo, footer, `rightRender`, `extraRender`, `github-star`). The 20 error-bearing files are untouched upstream files — `culori/fn` typings, `noFound` vs `notFound`, `UserInfo.fullName` vs `full_name` and similar. Baseline unchanged, not repaired. |
  | `pnpm run build` | `Webpack: Compiled successfully in 3.90m`, exit 0 |
  | `dist/index.html` | `<title>OriginHub</title>` |
  | bundle audit | 7 files contain `OriginHub`; 8 contain `GPUStack`, and every form of it is accounted for: `X-GPUStack-Model` (the wire header, five locales), the attribution string rendered in the footer, one stale backend-message match, and — see below — a leak that this audit is what found |

- **The bundle audit found a leak the source review had missed.** `src/pages/cluster-management/config/yaml-template.ts` is a commented YAML example rendered in the cluster chart-values editor, and it said "GPUStack's own" and "verbose logging on the GPUStack workers". Every guard here reads source, and every guard passed: the string is inside a template literal in a config module, which no rule covered. It was found by grepping the _built bundle_, which is why the guard now checks for the bare brand word in non-comment source with a pinned allow-list (`config/branding.ts` declares the upstream name; `llmodels/hooks` matches a sentence the backend used to emit). Verified to fail on injection, as before: a throwaway file containing the bare word was detected, then removed.
- No automated test suite exists in this repository, so there was nothing to regress against. The backend suite is the closest thing, and it now serves this build: see the note in the backend's `CHANGES.md`.
- The `ORIGINHUB_LINKS` define is parsed with `JSON.parse` at module scope; it is fed by `JSON.stringify(externalLinkOverrides())` in `config/config.ts`. That pairing is the reason the value is a JSON literal rather than an object spread: umi's `define` cannot do dynamic `process.env` lookups in a browser bundle. The build compiles it; that it produces the intended link values is still only reasoned, not exercised — no link was clicked.
- The text wordmark and monogram compiled into the bundle but have **never been seen rendered.** They are styled text derived from `PRODUCT_NAME`, sized to match the images they replace (24px in the sidebar, 36px on the login form, 30px in the version dialog, 16px in the provider list), and the build proves the code is valid — not that it looks right. First thing to check when `pnpm dev` runs: the sidebar both expanded and collapsed, and the login form.
- One correction made during review, worth recording because it is the kind of error a rebrand introduces by reflex: `config/branding.ts` first carried `Copyright (c) 2024-2026 The GPUStack authors`, copied from the backend repository's LICENSE. This repository's LICENSE says `Copyright (c) 2024`, and the footer renders this constant — so the console would have cited a wider range than its own licence grants. It now says 2024, and `UPSTREAM_URL` points at `gpustack/gpustack-ui` rather than the backend repository.

## Legal files

- `LICENSE` — unchanged, including the upstream `Copyright (c) 2024 The GPUStack authors` line at the end of the file. Apache-2.0 §4(c).
- `NOTICE` — added: attribution, trademark disclaimer, third-party component inventory, and the component flagged as requiring verification.
- `README.md` — added the licence and acknowledgement section that the upstream README does not have, and repointed the issue-tracker instruction that sent this product's bug reports upstream.
