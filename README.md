# Cherry Blossom (🌸 `cherryblossom`)

An ultra-lightweight, zero-dependency canvas library that adds realistic, floating cherry blossom petals (sakura) to any web page. Features realistic 3D fluttering, ambient wind variations, interactive mouse breeze swirl/repulsion, and retina display support.

## Features

- **Realistic Sakura Petals:** Bezier-curved petal geometry with natural notched tips and multi-tone pastel pink gradients.
- **3D Flutter Dynamics:** Simulates yaw, pitch, roll, and air-resistance tumbling.
- **Interactive Mouse Breeze:** Hovering or moving your cursor creates dynamic breeze waves that disperse nearby petals.
- **High-DPI / Retina Ready:** Automatically scales to match `devicePixelRatio` with crisp rendering.
- **Accessible:** Respects `prefers-reduced-motion` preferences automatically.
- **Zero Dependencies:** Pure vanilla TypeScript, lightweight footprint.
- **Universal:** Compatible with modern bundlers (ESM, CommonJS, and IIFE browser builds). SSR-safe.

## Installation

```bash
npm install cherryblossom
```

## Quick Start

### ES Module / TypeScript

```typescript
import { CherryBlossom } from "cherryblossom";

// Start cherry blossoms falling across the page
const blossom = new CherryBlossom();
```

### Vanilla HTML / CDN

```html
<script src="https://cdn.jsdelivr.net/npm/cherryblossom/dist/cherryblossom.global.global.js"></script>
<script>
  const blossom = new CherryBlossom();
</script>
```

## Configuration & Options

You can pass an optional configuration object to customize petals, wind, and behavior:

```typescript
const blossom = new CherryBlossom({
  // Number of petals on screen (default: 45)
  number: 50,

  // Target container (default: document.body)
  root: document.body,

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
  respectReducedMotion: true
});
```

## Methods & API

```typescript
// Stop / pause animation
blossom.stop();

// Resume animation
blossom.start();

// Dynamically change petal count
blossom.number = 80;

// Permanently tear down canvas and listeners
blossom.clear();
```

## License

MIT
