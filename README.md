# OriginHub Console

Web console for [OriginHub](https://github.com/NightThought/gpustack), an AI infrastructure and LLM inference serving platform. Modified from the [GPUStack](https://github.com/gpustack/gpustack) web console; see [License and acknowledgement](#license-and-acknowledgement).

## Installation

1. [Nodejs](https://nodejs.org/en) 16.0+(with NPM)

If you're on Mac

```
brew install node
```

2. [pnpm](https://pnpm.io/installation#using-npm)

```
npm install -g pnpm
```

3. Setup

```
git clone https://github.com/NightThought/gpustack-ui/
```

4. Install dependencies

```
cd gpustack-ui
pnpm install
```

## Usage

1. Run development server (at http://localhost:9000)

```
npm run dev
```

2. build release

```
npm run build
```

### Build-time branding configuration

Every outbound link, the footer entity name and the brand artwork are configurable, so a deployment can point at its own documentation site and portal without a code change. See `config/branding.ts` and `src/constants/external-links.ts`.

```
ORIGINHUB_COMPANY="Your Company Ltd" \
ORIGINHUB_LINK_DOCUMENTATION=https://docs.example.com \
ORIGINHUB_LINK_SITE=https://example.com \
ORIGINHUB_LINK_DISCORD=https://discord.gg/your-server \
ORIGINHUB_LOGO=/brand/wordmark.png \
ORIGINHUB_MINI_LOGO=/brand/mark.png \
npm run build
```

An unset link is hidden from the UI rather than rendered as a dead anchor. The logo values are URLs the browser resolves — an absolute `https://` URL, or a path served from `public/`. With no logo configured the console renders the product name as text rather than another company's wordmark, which is deliberate: a placeholder that looks finished is worse than one that does not. The favicon is served from `public/`, so it can be replaced in a deployed build by dropping a file on `public/static/favicon.png` — no rebuild needed.

## Bugs & Issues

- Please submit [bugs and issues](https://github.com/NightThought/gpustack/issues) with a label `ui`

## Links

- Backend and platform: https://github.com/NightThought/gpustack

## License and acknowledgement

This console is a derivative work of the GPUStack web console (https://github.com/gpustack/gpustack-ui), licensed under the Apache License, Version 2.0. The full licence text is in [LICENSE](LICENSE), and it retains the upstream notice:

    Copyright (c) 2024 The GPUStack authors

A summary of the modifications made to the upstream work is in [CHANGES.md](CHANGES.md); the attribution, trademark notice and third-party component inventory are in [NOTICE](NOTICE).

"GPUStack" is a trademark of its respective owner. Naming it here attributes the origin of this software as the Apache License requires; it does not imply any affiliation with, or endorsement by, the GPUStack project. The API this console calls is OpenAI-compatible in shape; that describes wire compatibility only, and implies no affiliation with or endorsement by any third party. Vendor and hardware marks shown as icons belong to their respective owners and are reproduced only to identify compatible hardware and model families.
