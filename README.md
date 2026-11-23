# Let It Blossom (🌸 `let-it-blossom`)

[![Socket Badge](https://badge.socket.dev/npm/package/let-it-blossom/1.0.0)](https://badge.socket.dev/npm/package/let-it-blossom/1.0.0)
[![NPM Version](https://img.shields.io/npm/v/let-it-blossom.svg?color=ff758f)](https://www.npmjs.com/package/let-it-blossom)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/austinhttps/let-it-blossom/actions/workflows/ci.yml/badge.svg)](https://github.com/austinhttps/let-it-blossom/actions/workflows/ci.yml)
[![Demo Pages](https://img.shields.io/badge/Demo-Live%20Page-brightgreen.svg)](https://austinhttps.github.io/let-it-blossom/)

An ultra-lightweight, zero-dependency canvas library that adds realistic, floating cherry blossom petals (sakura) to any web page. Features realistic 3D fluttering, ambient wind variations, interactive mouse breeze swirl/repulsion, and retina display support.

[**Live Interactive Demo**](https://austinhttps.github.io/let-it-blossom/)

---

## Features

- **Realistic Sakura Petals:** Bezier-curved petal geometry with natural notched tips and multi-tone pastel pink gradients.
- **3D Flutter Dynamics:** Simulates yaw, pitch, roll, and air-resistance tumbling.
- **Interactive Mouse Breeze:** Hovering or moving your cursor creates dynamic breeze waves that disperse nearby petals.
- **High-DPI / Retina Ready:** Automatically scales to match `devicePixelRatio` with crisp rendering.
- **Accessible:** Respects `prefers-reduced-motion` preferences automatically.
- **Zero Dependencies:** Pure vanilla TypeScript, lightweight footprint.
- **Universal:** Compatible with modern bundlers (ESM, CommonJS, and IIFE browser builds). SSR-safe.

---

## Installation

### NPM
```bash
npm install let-it-blossom
```

### Yarn
```bash
yarn add let-it-blossom
```

### PNPM
```bash
pnpm add let-it-blossom
```

### GitHub Packages
To install via the GitHub Packages registry:
```bash
npm install @austinhttps/let-it-blossom --registry=https://npm.pkg.github.com
```

---

## Quick Start

### ES Module / TypeScript

```typescript
import { CherryBlossom } from "let-it-blossom";

// Start cherry blossoms falling across the page with default options
const blossom = new CherryBlossom();
```

### Vanilla HTML / CDN

```html
<script src="https://unpkg.com/let-it-blossom@latest/dist/cherryblossom.global.global.js"></script>
<script>
  // Mounts directly to window.CherryBlossom
  const blossom = new CherryBlossom();
</script>
```

---

## Configuration & Options

You can pass an optional configuration object to customize petals, wind, and behavior:

```typescript
const blossom = new CherryBlossom({
  // Number of petals on screen (default: 45)
  number: 50,

  // Target container (default: document.body)
  root: document.body,

  // Gravity velocity range [min, max]
  gravityRange: [1.2, 2.6],

  // Wind and gust options
  wind: {
    speed: 1.5,            // Base horizontal drift
    gust: 1.5,             // Periodic wind gust variance
    enableMouseBreeze: true,// Petals react to mouse movement
    mouseRadius: 140,      // Cursor influence radius in px
    mouseForce: 1.8        // Repulsion strength
  },

  // Petal visuals
  petalStyle: {
    colors: ["#ffb7c5", "#ff8da1", "#fca3b7", "#ffe4e9"],
    opacityRange: [0.75, 0.95],
    sizeRange: [12, 22]
  },

  // Accessibility
  respectReducedMotion: true,

  // Max pixel ratio for high DPI displays (default: 2)
  maxPixelRatio: 2
});
```

---

## Methods & API

```typescript
// Stop / pause animation
blossom.stop();

// Resume animation
blossom.start();

// Dynamically change petal count
blossom.number = 80;

// Update wind dynamically
blossom.wind = { speed: 3.0, gust: 2.5 };

// Permanently tear down canvas and listeners
blossom.clear();
```

---

## Security

Security is a high priority. Please refer to our [Security Policy](SECURITY.md) to report vulnerabilities or see supported versions.

---

## Credits & Authors

- **Created & Maintained by:** [Austin M](https://github.com/austinhttps)
- **Inspired by:** The beauty of sakura in spring and the natural physics of falling petals.

---

## License

[MIT](LICENSE) © Austin M
