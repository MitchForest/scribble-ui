# Scribble UI

A **Rough.js hand-drawn component library** built on Radix primitives. Provides a sketchy, organic aesthetic for React applications.

<p align="center">
  <a href="https://mitchforest.com/projects/scribble-ui">Documentation</a> •
  <a href="https://github.com/MitchForest/scribble-ui">GitHub</a>
</p>

## Features

- 🎨 **Hand-drawn aesthetics** - Rough.js-powered sketchy borders and fills
- ♿ **Accessible** - Built on Radix UI primitives
- 🎯 **Themeable** - CSS custom properties for easy customization
- 📦 **shadcn-compatible** - Install via `npx shadcn add`

## Installation

### Via shadcn CLI (recommended)

Add the registry to your `components.json`:

```json
{
  "registries": {
    "scribble-ui": {
      "url": "https://mitchforest.com/r/scribble-ui/registry.json"
    }
  }
}
```

Then add components:

```bash
npx shadcn add scribble-ui/button
npx shadcn add scribble-ui/card
npx shadcn add scribble-ui/annotation-underline
```

### Required Base Install

Always install the lib and styles first:

```bash
npx shadcn add scribble-ui/lib
npx shadcn add scribble-ui/styles
```

## Components

### Core Components
- `button` - Hand-drawn button with sketchy border
- `card` - Card container with rough border and optional tape decorations
- `dialog` - Modal dialog with hand-drawn frame
- `input` - Text input with sketchy underline
- `checkbox` - Hand-drawn checkbox
- `select` - Dropdown with rough styling
- `badge` - Simple badge component
- `toast` - Toast notifications
- `tabs` - Tabbed interface
- `table` - Data table with rough borders
- `tooltip` - Tooltip with sketchy background
- `accordion` - Collapsible sections
- `sidebar` - Navigation sidebar
- `progress` - Progress bar with rough fill

### Annotations
- `underline` - Animated hand-drawn underline
- `highlight` - Text highlight with hachure fill
- `bracket` - Curly bracket annotation
- `circle` - Circle around content
- `box` - Box around content
- `crossed-off` - Strikethrough annotation

### Decorative
- `arrow` - Hand-drawn arrow
- `divider` - Sketchy horizontal divider
- `doodle` - Random doodle shapes
- `heart` - Hand-drawn heart
- `star` - Hand-drawn star
- `sticky-note` - Post-it note with tape
- `tape` - Tape strip decoration

## Theming

Scribble UI uses CSS custom properties. Override them in your CSS:

```css
:root {
  --scribble-stroke: #1a1a1a;
  --scribble-stroke-accent: #e07a5f;
  --scribble-roughness: 1.5;
  --scribble-bg: #fffef8;
}
```

See `styles/variables.css` for all available variables.

## Built With

Scribble UI stands on the shoulders of giants:

- [Rough.js](https://roughjs.com/) - The graphics library that powers the hand-drawn aesthetic
- [Rough Notation](https://roughnotation.com/) - Inspiration for annotation components
- [Radix UI](https://www.radix-ui.com/) - Accessible, unstyled primitives

## Author

Created by [Mitch Forest](https://mitchforest.com)

## License

MIT
