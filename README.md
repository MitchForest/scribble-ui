# Scribble UI

A **hand-drawn React component library** powered by Rough.js. Provides sketchy, organic aesthetics with full accessibility via Radix primitives.

<p align="center">
  <a href="https://mitchforest.com/projects/scribble-ui">Documentation</a> •
  <a href="https://github.com/MitchForest/scribble-ui">GitHub</a>
</p>

## Quick Start

**1. Add the registry to your `components.json`:**

```json
{
  "registries": {
    "@scribble-ui": "https://mitchforest.com/r/scribble-ui/{name}.json"
  }
}
```

**2. Install components:**

```bash
npx shadcn@latest add @scribble-ui/button
```

That's it! Dependencies are installed automatically.

---

## Full Installation Guide

### Prerequisites

- React 18+
- Tailwind CSS v4+
- [shadcn/ui](https://ui.shadcn.com/docs/installation) initialized in your project

### Step 1: Configure Registry

Add the scribble-ui registry to your `components.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  },
  "registries": {
    "@scribble-ui": "https://mitchforest.com/r/scribble-ui/{name}.json"
  }
}
```

### Step 2: Install Components

```bash
# Install individual components (dependencies auto-resolve)
npx shadcn@latest add @scribble-ui/button
npx shadcn@latest add @scribble-ui/card
npx shadcn@latest add @scribble-ui/dialog

# Or install multiple at once
npx shadcn@latest add @scribble-ui/button @scribble-ui/card @scribble-ui/input
```

### Step 3: (Optional) Add CSS Variables

For custom theming, install the styles:

```bash
npx shadcn@latest add @scribble-ui/styles
```

Then import in your CSS:

```css
@import "./components/scribble-ui/styles/variables.css";
```

---

## Components

### Core UI
| Component | Install |
|-----------|---------|
| Button | `@scribble-ui/button` |
| Card | `@scribble-ui/card` |
| Dialog | `@scribble-ui/dialog` |
| Alert Dialog | `@scribble-ui/alert-dialog` |
| Input | `@scribble-ui/input` |
| Textarea | `@scribble-ui/textarea` |
| Checkbox | `@scribble-ui/checkbox` |
| Select | `@scribble-ui/select` |
| Tabs | `@scribble-ui/tabs` |
| Accordion | `@scribble-ui/accordion` |
| Table | `@scribble-ui/table` |
| Tooltip | `@scribble-ui/tooltip` |
| Toast | `@scribble-ui/toast` |
| Sidebar | `@scribble-ui/sidebar` |
| Progress | `@scribble-ui/progress` |
| Skeleton | `@scribble-ui/skeleton` |
| Badge | `@scribble-ui/badge` |
| Label | `@scribble-ui/label` |
| Toggle | `@scribble-ui/toggle` |
| Avatar | `@scribble-ui/avatar` |
| Avatar Picker | `@scribble-ui/avatar-picker` |
| Input OTP | `@scribble-ui/input-otp` |
| Rating | `@scribble-ui/rating` |
| Selection Card | `@scribble-ui/selection-card` |
| Link | `@scribble-ui/link` |
| Chart | `@scribble-ui/chart` |

### Annotations
| Component | Install |
|-----------|---------|
| Underline | `@scribble-ui/annotation-underline` |
| Highlight | `@scribble-ui/annotation-highlight` |
| Bracket | `@scribble-ui/annotation-bracket` |
| Circle | `@scribble-ui/annotation-circle` |
| Box | `@scribble-ui/annotation-box` |
| Crossed Off | `@scribble-ui/annotation-crossed-off` |

### Decorative
| Component | Install |
|-----------|---------|
| Arrow | `@scribble-ui/decorative-arrow` |
| Divider | `@scribble-ui/decorative-divider` |
| Doodle | `@scribble-ui/decorative-doodle` |
| Heart | `@scribble-ui/decorative-heart` |
| Star | `@scribble-ui/decorative-star` |
| Sticky Note | `@scribble-ui/decorative-sticky-note` |
| Tape | `@scribble-ui/decorative-tape` |

### Backgrounds
| Component | Install |
|-----------|---------|
| Notebook | `@scribble-ui/background-notebook` |
| Torn Edge | `@scribble-ui/background-torn-edge` |

---

## Theming

Override CSS custom properties to match your brand:

```css
:root {
  --scribble-stroke: #1a1a1a;
  --scribble-stroke-accent: #e07a5f;
  --scribble-roughness: 1.5;
  --scribble-bg: #fffef8;
}
```

See the [styles component](https://mitchforest.com/projects/scribble-ui) for all available variables.

---

## Credits

Scribble UI stands on the shoulders of giants:

- [Rough.js](https://roughjs.com/) - The graphics library powering the hand-drawn aesthetic
- [Rough Notation](https://roughnotation.com/) - Inspiration for annotation components
- [Radix UI](https://www.radix-ui.com/) - Accessible, unstyled component primitives

---

## Author

Created by [Mitch Forest](https://mitchforest.com)

## License

MIT
