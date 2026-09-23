// Brand and attribution guard for the OriginHub console.
//
// Why this exists: a rebrand is not a one-time edit, it is a state that silently
// decays. The two failures it decays into are both expensive, and neither looks
// like a bug while it is happening:
//
//   1. brand regression   — an upstream merge (or a tired edit) reintroduces a
//                           user-visible "GPUStack" string, or reintroduces a
//                           link that sends this product's users to upstream's
//                           docs, Discord or issue tracker.
//   2. attribution loss   — someone "cleans up" the upstream copyright notice.
//                           Under Apache-2.0 §4(c) that is not cleanup, it is a
//                           licence violation, and it is the single most likely
//                           mistake in a fork that renames itself.
//
// So the guard checks both directions: the brand must be present, the
// attribution must be present, the compatibility surfaces must be *unchanged*,
// and the third-party artwork must be neither renamed nor deleted.
//
// Deliberately no dependencies: this must run in a checkout before `pnpm
// install`, and it must run in CI without waiting on the deps job.
//
// Run:  node scripts/check-brand.cjs

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));

const failures = [];
const check = (ok, label, detail = '') => {
  if (!ok) failures.push(`${label}${detail ? ` — ${detail}` : ''}`);
  console.log(`${ok ? 'ok:  ' : 'FAIL '} ${label}${detail && !ok ? ` — ${detail}` : ''}`);
};

const section = (title) => console.log(`\n== ${title} ==`);

/**
 * Every source file under the given directories, as repo-relative paths.
 *
 * A filesystem walk rather than `git ls-files`, because the check has to catch a
 * brand string in a file that is new and not yet staged — which is exactly when
 * brand strings get written. Ignored directories are skipped so this works with
 * or without node_modules present.
 */
const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  '.umi',
  '.umi-production',
  '.umi-test',
  'coverage',
  '_sbom'
]);

function sourceFiles(extensions, dirs = ['src', 'config']) {
  const found = [];
  const walk = (absolute, relative) => {
    for (const entry of fs.readdirSync(absolute, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (IGNORED_DIRS.has(entry.name) || entry.name.startsWith('.')) continue;
        walk(path.join(absolute, entry.name), `${relative}${entry.name}/`);
        continue;
      }
      const file = `${relative}${entry.name}`;
      if (extensions.includes(path.extname(file))) {
        found.push(file);
      }
    }
  };
  for (const dir of dirs) {
    if (exists(dir)) walk(path.join(ROOT, dir), `${dir}/`);
  }
  return found.sort();
}

// ----------------------------------------------------------------------------
section('legal files present and intact (§4(a)(b)(c))');

const UPSTREAM_COPYRIGHT = 'Copyright (c) 2024 The GPUStack authors';

check(exists('LICENSE'), 'LICENSE present');
check(exists('NOTICE'), 'NOTICE present');
check(exists('CHANGES.md'), 'CHANGES.md present (§4(b) modification notice)');

if (exists('LICENSE')) {
  const license = read('LICENSE');
  check(
    license.includes('Apache License') &&
      license.includes('TERMS AND CONDITIONS FOR USE'),
    'LICENSE is the Apache-2.0 text, not a substitute'
  );
  check(
    license.includes(UPSTREAM_COPYRIGHT),
    'LICENSE retains the upstream copyright notice (§4(c))'
  );
}

if (exists('NOTICE')) {
  const notice = read('NOTICE');
  check(
    notice.includes(UPSTREAM_COPYRIGHT),
    'NOTICE retains the upstream copyright notice (§4(c))'
  );
  check(
    /derivative work/i.test(notice),
    'NOTICE states that this is a derivative work'
  );
  check(
    /not endorsed by|no affiliation/i.test(notice),
    'NOTICE carries the trademark / no-endorsement disclaimer'
  );
  check(
    /core-ui/.test(notice),
    'NOTICE records the unresolved @gpustack/core-ui licensing question'
  );
}

if (exists('CHANGES.md')) {
  check(
    /§4\(b\)|4\(b\)/.test(read('CHANGES.md')),
    'CHANGES.md identifies itself as the §4(b) notice'
  );
}

if (exists('README.md')) {
  const readme = read('README.md');
  check(
    readme.includes(UPSTREAM_COPYRIGHT),
    'README retains the upstream copyright line'
  );
  check(
    /[Mm]odified from|derivative work/.test(readme),
    'README states that this is a modified work (§4(b))'
  );
  check(
    !/submit \[bugs and issues\]\(https:\/\/github\.com\/gpustack\//.test(
      readme
    ),
    'README does not route this product\'s bug reports to upstream'
  );
}

// ----------------------------------------------------------------------------
section('brand has a single source');

check(
  exists('config/branding.ts') && exists('src/config/branding.ts'),
  'branding module present in both config/ and src/'
);

if (exists('config/branding.ts')) {
  const branding = read('config/branding.ts');
  check(
    /export const PRODUCT_NAME = 'OriginHub';/.test(branding),
    'PRODUCT_NAME is defined exactly once, in config/branding.ts'
  );
  check(
    branding.includes(UPSTREAM_COPYRIGHT),
    'branding module keeps the upstream attribution next to the brand name'
  );
}

const files = sourceFiles(['.ts', '.tsx']);

// A second copy of the product name is how a rebrand ends up half applied: the
// file nobody edits. Locales are excluded because a translation table is a
// string store, not a definition; `OriginHub` in a .tsx means someone typed the
// brand where they should have imported it.
const hardcodedName = files.filter((file) => {
  if (file.startsWith('src/locales/') || file === 'config/branding.ts') {
    return false;
  }
  const text = read(file);
  // Comments are exempt: naming the product while explaining the code is not a
  // rendering path. Only quotes and JSX text count.
  const code = text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
  return /['"`(>]OriginHub['"`)\s<]/.test(code);
});
check(
  hardcodedName.length === 0,
  'no hardcoded "OriginHub" outside the branding module and the locales',
  hardcodedName.join(', ')
);

// ----------------------------------------------------------------------------
section('compatibility surfaces unchanged');

// These are wire/storage contracts with the backend and the browser, not
// branding. Renaming them is a functional regression dressed as a cleanup, so
// the guard fails if they disappear — the same way it would fail if a brand
// string reappeared.
const CONTRACTS = [
  {
    label: 'GPUSTACK_API_BASE_URL (backend API prefix)',
    pattern: /GPUSTACK_API_BASE_URL/,
    file: 'src/config/settings.ts'
  },
  {
    label: 'getGPUStackPlugin (plugin seam name)',
    pattern: /getGPUStackPlugin/,
    dir: 'src'
  }
];

for (const { label, pattern, file, dir } of CONTRACTS) {
  if (file) {
    check(exists(file) && pattern.test(read(file)), label, file);
    continue;
  }
  const hit = files.some(
    (candidate) => candidate.startsWith(`${dir}/`) && pattern.test(read(candidate))
  );
  check(hit, label, dir);
}

// ----------------------------------------------------------------------------
section('no upstream property is linked as if it were ours');

// `docs.gpustack.ai` is allowed to appear exactly where it already does: the
// five "installation requirements" help strings in the locales, which have no
// forked equivalent yet. That is a recorded debt, not a licence — so the count
// is pinned. More occurrences, or an occurrence anywhere else, is a regression;
// fewer means the debt was paid and this allow-list should be tightened.
const DOC_LINK_ALLOW = {
  'src/locales/en-US/resources.ts': 1,
  'src/locales/zh-CN/resources.ts': 1,
  'src/locales/ja-JP/resources.ts': 1,
  'src/locales/ru-RU/resources.ts': 1,
  'src/locales/tr-TR/resources.ts': 1,
  // The one place the upstream docs host is allowed to live in code: the
  // fallback inside docLink(). Every caller passes a path, so setting
  // ORIGINHUB_LINK_DOCUMENTATION repoints all of them at once. A second
  // occurrence anywhere is a component bypassing that knob again.
  'src/constants/external-links.ts': 1
};

const UPSTREAM_URL = /https?:\/\/(www\.)?(docs\.)?gpustack\.ai/g;
const COMMUNITY_URL = /https?:\/\/discord\.gg\//g;

const linksFile = read('src/constants/external-links.ts');

let docLinkFindings = [];
let communityFindings = [];
for (const file of files) {
  const text = read(file);
  const docHits = text.match(UPSTREAM_URL) || [];
  const allowed = DOC_LINK_ALLOW[file] || 0;
  if (docHits.length !== allowed) {
    docLinkFindings.push(`${file}: ${docHits.length} (expected ${allowed})`);
  }
  if (file === 'src/locales/check.ts') continue;
  if ((text.match(COMMUNITY_URL) || []).length) {
    communityFindings.push(file);
  }
}
check(
  docLinkFindings.length === 0,
  'docs.gpustack.ai occurrences match the recorded debt exactly',
  docLinkFindings.join('; ')
);
check(
  /export const docLink/.test(linksFile) &&
    /UPSTREAM_DOCS_BASE/.test(linksFile),
  'docLink() exists so documentation paths are repointed by one variable'
);
check(
  communityFindings.length === 0,
  'no upstream Discord invite is offered as this product\'s community',
  communityFindings.join(', ')
);

// The help links must not fall back to upstream either: unconfigured means
// empty, and empty means hidden. See src/constants/external-links.ts.
for (const key of ['documentation', 'discord', 'site', 'faq', 'imageSelector', 'resetPassword']) {
  const line = new RegExp(`\\s${key}:\\s*(.*)`).exec(linksFile);
  const value = line ? line[1] : '';
  const upstream = /gpustack\.ai|discord\.gg|github\.com\/gpustack\//.test(value);
  check(
    !upstream,
    `external link "${key}" does not default to an upstream property`,
    value.trim()
  );
}

// ----------------------------------------------------------------------------
section('no upstream brand in anything that can reach a screen');

// The console legitimately contains `GPUStackPlugin`, `GPUStackVersionAtom`,
// `getGPUStackPlugin` and `X-GPUStack-*` — compatibility surfaces this rebrand
// keeps on purpose — so the pattern is the *bare* word: not followed by an
// identifier character, not the `X-GPUStack-` wire prefix, not `getGPUStack`.
//
// Comments are stripped before matching, because a comment that says GPUStack is
// a developer reading the code learning where it came from, which is what the
// attribution is for. What must not exist is the bare word in a string or a
// template literal, where it reaches a user.
//
// This check exists because a leak got past every other check here exactly once:
// a commented YAML example shown in the cluster chart-values editor said
// "GPUStack's own" and "verbose logging on the GPUStack workers", and it was
// found by grepping the *built bundle* rather than the source. A guard that only
// reads source would have kept missing it.
const BARE_BRAND = /(?<!X-)(?<!get)\bGPUStack\b(?!-)/;
const ALLOWED_BARE = {
  // Declares the upstream name; the attribution constant has to spell it.
  'config/branding.ts': 2,
  // A prefix match against a sentence the backend used to produce, not copy this
  // console writes. Renaming it would break the match and change nothing visible;
  // the backend emits different text today, so the branch is already dead. See
  // CHANGES.md, and the finding below is the reminder to revisit it.
  'src/pages/llmodels/hooks/index.ts': 1
};

const bareFindings = [];
for (const file of files) {
  const code = read(file)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/^\s*\*.*$/gm, '');
  const hits = (code.match(new RegExp(BARE_BRAND, 'g')) || []).length;
  const allowed = ALLOWED_BARE[file] || 0;
  if (hits !== allowed) {
    bareFindings.push(`${file}: ${hits} (expected ${allowed})`);
  }
}
check(
  bareFindings.length === 0,
  'bare upstream brand appears only where it is recorded',
  bareFindings.join('; ')
);

// ----------------------------------------------------------------------------
section('define values are shaped the way umi expects');

// umi stringifies every `define` value itself before handing it to webpack, so a
// value that is stringified here as well arrives with its quotes intact. That is
// not hypothetical: this file's own history contains a change that "fixed" the
// missing stringify, and the bundle then carried `"Acme Ltd"` in the footer, with
// the unset case becoming the two-character string `""` instead of falling back.
// The mechanism is one line of umi — @umijs/bundler-webpack
// dist/config/definePlugin.js: `define[key] = JSON.stringify(userConfig.define[key])`.
const configTs = read('config/config.ts');
const defineValue = (key) => {
  const match = new RegExp(`'process\\.env\\.${key}':\\s*(.+)$`, 'm').exec(
    configTs
  );
  return match ? match[1].trim() : '';
};

const RAW_VALUE_KEYS = [
  'ORIGINHUB_COMPANY',
  'ORIGINHUB_LOGO',
  'ORIGINHUB_MINI_LOGO'
];
for (const key of RAW_VALUE_KEYS) {
  const value = defineValue(key);
  check(
    value !== '' && !/JSON\.stringify/.test(value),
    `define ${key} passes a raw value (umi stringifies it itself)`,
    value || 'not found'
  );
}

// The links blob is the deliberate exception: it is parsed at runtime, so the
// extra stringify is exactly what the runtime `JSON.parse` needs to see.
check(
  /JSON\.stringify/.test(defineValue('ORIGINHUB_LINKS')),
  'define ORIGINHUB_LINKS is stringified, because the app parses it',
  defineValue('ORIGINHUB_LINKS')
);
check(
  /JSON\.parse\(\s*process\.env\.ORIGINHUB_LINKS/.test(linksFile),
  'external-links parses the links blob at runtime, matching that define'
);

// ----------------------------------------------------------------------------
section('third-party artwork untouched');

// Hardware and model-provider marks belong to other companies. A rebrand must
// not delete them, overwrite them, or "rename" them; pinning the file count
// catches a bulk delete, which is the realistic failure here.
const ASSET_COUNTS = {
  'src/assets/providers-logo': 36,
  'src/assets/logo': 22,
  'src/assets/images': 14
};

for (const [dir, expected] of Object.entries(ASSET_COUNTS)) {
  const actual = exists(dir) ? fs.readdirSync(path.join(ROOT, dir)).length : -1;
  check(
    actual === expected,
    `${dir} file count unchanged (third-party marks)`,
    `found ${actual}, expected ${expected}`
  );
}

// ----------------------------------------------------------------------------
section('brand assets have one entry point');

check(exists('src/config/logos.ts'), 'logo override module present');
if (exists('src/config/logos.ts')) {
  const logos = read('src/config/logos.ts');
  check(
    /ORIGINHUB_LOGO/.test(logos) && /ORIGINHUB_MINI_LOGO/.test(logos),
    'logos are overridable without editing consumers'
  );
}

const directLogoImports = files.filter(
  (file) =>
    file !== 'src/config/logos.ts' &&
    !file.startsWith('src/components/brand-logo/') &&
    /@\/assets\/images\/(gpustack-logo|small-logo)/.test(read(file))
);
check(
  directLogoImports.length === 0,
  'only the brand-logo component and config/logos touch the bundled brand image',
  directLogoImports.join(', ')
);

// The default must be text, not the upstream picture. Two things make that true,
// and a regression in either silently puts someone else's wordmark back in front
// of every user: the component must derive its text from the brand source of
// truth, and the sidebar hook must not fall back to a bundled asset.
const brandLogo = 'src/components/brand-logo/index.tsx';
if (exists(brandLogo)) {
  check(
    /PRODUCT_NAME/.test(read(brandLogo)),
    'the text fallback is driven by PRODUCT_NAME, not a literal'
  );
} else {
  check(false, 'brand-logo component present', brandLogo);
}

const useLogo = read('src/hooks/use-logo.ts');
check(
  !/BUNDLED_|PRODUCT_WORDMARK|PRODUCT_MARK/.test(useLogo),
  'the sidebar logo does not fall back to bundled upstream artwork',
  'src/hooks/use-logo.ts'
);

// ----------------------------------------------------------------------------
if (failures.length) {
  console.error(`\nbrand guard: ${failures.length} check(s) failed\n`);
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  console.error(
    '\n  If a rename here was intentional, update the recorded expectations\n' +
      '  in this file and say why in the commit message. Do not delete a\n' +
      '  copyright or attribution check to make it pass.\n'
  );
  process.exit(1);
}

console.log('\nbrand guard: all checks passed');
