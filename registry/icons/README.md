# Rough Icons

Hand-drawn icons using Rough.js, mirroring the iOS `RoughSFSymbol` pipeline.

## How It Works

```
Lucide SVG files
       ↓
extract-lucide-paths.js (parses SVG path data)
       ↓
icon-paths.ts (path commands as TypeScript)
       ↓
RoughIcon component (linearizes curves → Rough.js)
       ↓
Sketchy, hand-drawn icons ✏️
```

## Components

### `RoughIcon` - Path-based icons (NEW)

Uses pre-extracted Lucide SVG paths, linearizes curves, and renders with Rough.js:

```tsx
import { RoughIcon } from "scribble-ui/icons/rough-icon"

<RoughIcon name="home" size={24} />
<RoughIcon name="star" size={32} color="accent" roughness={1.5} />
```

**Available icons:** 82 icons from Lucide (home, star, heart, check, x, etc.)

### `ScribbleIcon` - Programmatic icons

Hand-coded icons using Rough.js primitives (circles, rectangles, lines):

```tsx
import { ScribbleIcon } from "scribble-ui/icons/icon"

<ScribbleIcon name="home" size={24} />
```

## Adding New Icons

### 1. Install lucide-static (if not installed)

```bash
npm install lucide-static --save-dev
```

### 2. Add icon names to the extraction script

Edit `scripts/extract-lucide-paths.js` and add icon names to `ICON_LIST`:

```js
const ICON_LIST = [
  // ... existing icons
  "new-icon-name",
];
```

### 3. Run the extraction

```bash
node scripts/extract-lucide-paths.js
```

This regenerates `icon-paths.ts` with the new icons.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `IconName` | - | Icon name from Lucide |
| `size` | `number` | 24 | Size in pixels |
| `color` | `string` | "default" | Stroke color (CSS var or hex) |
| `strokeWidth` | `number` | 1.5 | Line thickness |
| `roughness` | `number` | 1.2 | Sketchiness (0=smooth, 2+=rough) |
| `bowing` | `number` | 1 | How much lines bow |
| `seed` | `number` | 42 | Deterministic rendering seed |

## Color Values

- `"default"` → `var(--scribble-stroke)`
- `"muted"` → `var(--scribble-stroke-muted)`
- `"accent"` → `var(--scribble-stroke-accent)`
- `"success"` → `var(--scribble-stroke-success)`
- `"warning"` → `var(--scribble-stroke-warning)`
- `"error"` → `var(--scribble-stroke-error)`
- Or any CSS color string: `"#e07a5f"`, `"red"`, etc.

## License

Icons sourced from [Lucide](https://lucide.dev) under the ISC License.
