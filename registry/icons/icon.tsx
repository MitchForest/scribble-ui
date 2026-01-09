/**
 * ScribbleIcon - Hand-drawn icons using Rough.js
 *
 * A collection of hand-drawn icons for use in the Scribble UI system.
 * Each icon is drawn with Rough.js for a sketchy, organic feel.
 */

import { useEffect, useMemo, useRef } from "react"
import rough from "roughjs"
import type { RoughSVG } from "roughjs/bin/svg"
import { cn } from "../lib/utils"

export type IconName =
  | "home"
  | "users"
  | "smartphone"
  | "user-group"
  | "link"
  | "settings"
  | "logout"
  | "chevron-right"
  | "chevron-down"
  | "plus"
  | "edit"
  | "delete"
  | "copy"
  | "check"
  | "x"
  | "search"
  | "refresh"
  | "arrow-left"
  | "arrow-right"
  | "message"
  | "help-circle"
  | "headset"
  | "star"
  | "star-filled"

export interface ScribbleIconProps {
  /** Icon name */
  name: IconName
  /** Icon size */
  size?: number
  /** Stroke color */
  color?: "default" | "muted" | "accent" | "success" | "warning" | "error" | string
  /** Stroke width */
  strokeWidth?: number
  /** Roughness level */
  roughness?: number
  /** Seed for consistent rendering */
  seed?: number
  /** Additional class names */
  className?: string
}

const colorMap: Record<string, string> = {
  default: "var(--scribble-stroke)",
  muted: "var(--scribble-stroke-muted)",
  accent: "var(--scribble-stroke-accent)",
  success: "var(--scribble-stroke-success)",
  warning: "var(--scribble-stroke-warning)",
  error: "var(--scribble-stroke-error)",
}

function getColor(color: string): string {
  if (color in colorMap) {
    if (typeof window !== "undefined") {
      const varName = colorMap[color].slice(4, -1)
      return (
        getComputedStyle(document.documentElement).getPropertyValue(varName).trim() ||
        "#1a1a1a"
      )
    }
    return "#1a1a1a"
  }
  return color
}

type DrawFunction = (
  rc: RoughSVG,
  size: number,
  color: string,
  strokeWidth: number,
  roughness: number,
  seed: number
) => SVGGElement

// Icon drawing functions
const iconDrawers: Record<IconName, DrawFunction> = {
  home: (rc, size, color, strokeWidth, roughness, seed) => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g")
    const opts = { roughness, stroke: color, strokeWidth, seed }
    const s = size

    // Roof (triangle)
    g.appendChild(
      rc.linearPath(
        [
          [s * 0.5, s * 0.15],
          [s * 0.15, s * 0.45],
          [s * 0.85, s * 0.45],
          [s * 0.5, s * 0.15],
        ],
        opts
      )
    )
    // House body
    g.appendChild(
      rc.rectangle(s * 0.2, s * 0.45, s * 0.6, s * 0.42, opts)
    )
    // Door
    g.appendChild(
      rc.rectangle(s * 0.4, s * 0.55, s * 0.2, s * 0.32, opts)
    )
    return g
  },

  users: (rc, size, color, strokeWidth, roughness, seed) => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g")
    const opts = { roughness, stroke: color, strokeWidth, seed }
    const s = size

    // Left person - head
    g.appendChild(rc.circle(s * 0.35, s * 0.3, s * 0.22, opts))
    // Left person - body arc
    g.appendChild(
      rc.arc(s * 0.35, s * 0.85, s * 0.4, s * 0.5, Math.PI, 0, false, opts)
    )

    // Right person - head (slightly behind)
    g.appendChild(rc.circle(s * 0.65, s * 0.3, s * 0.22, { ...opts, seed: seed + 1 }))
    // Right person - body arc
    g.appendChild(
      rc.arc(s * 0.65, s * 0.85, s * 0.4, s * 0.5, Math.PI, 0, false, { ...opts, seed: seed + 1 })
    )
    return g
  },

  smartphone: (rc, size, color, strokeWidth, roughness, seed) => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g")
    const opts = { roughness, stroke: color, strokeWidth, seed }
    const s = size

    // Phone body (rounded rectangle via path)
    g.appendChild(rc.rectangle(s * 0.25, s * 0.1, s * 0.5, s * 0.8, opts))
    // Screen
    g.appendChild(
      rc.rectangle(s * 0.3, s * 0.18, s * 0.4, s * 0.58, { ...opts, seed: seed + 1 })
    )
    // Home button
    g.appendChild(rc.circle(s * 0.5, s * 0.82, s * 0.06, { ...opts, seed: seed + 2 }))
    return g
  },

  "user-group": (rc, size, color, strokeWidth, roughness, seed) => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g")
    const opts = { roughness, stroke: color, strokeWidth, seed }
    const s = size

    // Center person (front)
    g.appendChild(rc.circle(s * 0.5, s * 0.28, s * 0.2, opts))
    g.appendChild(
      rc.arc(s * 0.5, s * 0.9, s * 0.4, s * 0.45, Math.PI, 0, false, opts)
    )

    // Left person (back)
    g.appendChild(rc.circle(s * 0.22, s * 0.35, s * 0.14, { ...opts, seed: seed + 1 }))
    g.appendChild(
      rc.arc(s * 0.22, s * 0.85, s * 0.28, s * 0.35, Math.PI, 0, false, { ...opts, seed: seed + 1 })
    )

    // Right person (back)
    g.appendChild(rc.circle(s * 0.78, s * 0.35, s * 0.14, { ...opts, seed: seed + 2 }))
    g.appendChild(
      rc.arc(s * 0.78, s * 0.85, s * 0.28, s * 0.35, Math.PI, 0, false, { ...opts, seed: seed + 2 })
    )
    return g
  },

  link: (rc, size, color, strokeWidth, roughness, seed) => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g")
    const opts = { roughness, stroke: color, strokeWidth, seed }
    const s = size

    // Two chain links
    g.appendChild(
      rc.arc(s * 0.35, s * 0.4, s * 0.3, s * 0.3, Math.PI * 0.5, Math.PI * 1.5, false, opts)
    )
    g.appendChild(rc.line(s * 0.35, s * 0.25, s * 0.55, s * 0.25, opts))
    g.appendChild(rc.line(s * 0.35, s * 0.55, s * 0.55, s * 0.55, opts))

    g.appendChild(
      rc.arc(s * 0.65, s * 0.6, s * 0.3, s * 0.3, Math.PI * 1.5, Math.PI * 0.5, false, {
        ...opts,
        seed: seed + 1,
      })
    )
    g.appendChild(rc.line(s * 0.45, s * 0.45, s * 0.65, s * 0.45, { ...opts, seed: seed + 1 }))
    g.appendChild(rc.line(s * 0.45, s * 0.75, s * 0.65, s * 0.75, { ...opts, seed: seed + 1 }))
    return g
  },

  settings: (rc, size, color, strokeWidth, roughness, seed) => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g")
    const opts = { roughness, stroke: color, strokeWidth, seed }
    const s = size

    // Center circle (gear hub)
    g.appendChild(rc.circle(s * 0.5, s * 0.5, s * 0.2, opts))

    // Gear teeth (6 lines radiating out)
    const teethCount = 6
    for (let i = 0; i < teethCount; i++) {
      const angle = (i * Math.PI * 2) / teethCount
      const innerR = s * 0.18
      const outerR = s * 0.38
      const x1 = s * 0.5 + Math.cos(angle) * innerR
      const y1 = s * 0.5 + Math.sin(angle) * innerR
      const x2 = s * 0.5 + Math.cos(angle) * outerR
      const y2 = s * 0.5 + Math.sin(angle) * outerR
      g.appendChild(rc.line(x1, y1, x2, y2, { ...opts, seed: seed + i }))
    }
    return g
  },

  logout: (rc, size, color, strokeWidth, roughness, seed) => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g")
    const opts = { roughness, stroke: color, strokeWidth, seed }
    const s = size

    // Door frame (partial rectangle)
    g.appendChild(rc.line(s * 0.2, s * 0.2, s * 0.2, s * 0.8, opts))
    g.appendChild(rc.line(s * 0.2, s * 0.2, s * 0.5, s * 0.2, opts))
    g.appendChild(rc.line(s * 0.2, s * 0.8, s * 0.5, s * 0.8, opts))

    // Arrow pointing out
    g.appendChild(rc.line(s * 0.4, s * 0.5, s * 0.85, s * 0.5, { ...opts, seed: seed + 1 }))
    g.appendChild(rc.line(s * 0.7, s * 0.35, s * 0.85, s * 0.5, { ...opts, seed: seed + 2 }))
    g.appendChild(rc.line(s * 0.7, s * 0.65, s * 0.85, s * 0.5, { ...opts, seed: seed + 3 }))
    return g
  },

  "chevron-right": (rc, size, color, strokeWidth, roughness, seed) => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g")
    const opts = { roughness, stroke: color, strokeWidth, seed }
    const s = size

    g.appendChild(
      rc.linearPath(
        [
          [s * 0.35, s * 0.2],
          [s * 0.65, s * 0.5],
          [s * 0.35, s * 0.8],
        ],
        opts
      )
    )
    return g
  },

  "chevron-down": (rc, size, color, strokeWidth, roughness, seed) => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g")
    const opts = { roughness, stroke: color, strokeWidth, seed }
    const s = size

    g.appendChild(
      rc.linearPath(
        [
          [s * 0.2, s * 0.35],
          [s * 0.5, s * 0.65],
          [s * 0.8, s * 0.35],
        ],
        opts
      )
    )
    return g
  },

  plus: (rc, size, color, strokeWidth, roughness, seed) => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g")
    const opts = { roughness, stroke: color, strokeWidth, seed }
    const s = size

    g.appendChild(rc.line(s * 0.5, s * 0.2, s * 0.5, s * 0.8, opts))
    g.appendChild(rc.line(s * 0.2, s * 0.5, s * 0.8, s * 0.5, { ...opts, seed: seed + 1 }))
    return g
  },

  edit: (rc, size, color, strokeWidth, roughness, seed) => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g")
    const opts = { roughness, stroke: color, strokeWidth, seed }
    const s = size

    // Pencil body (diagonal line)
    g.appendChild(rc.line(s * 0.2, s * 0.8, s * 0.7, s * 0.3, opts))
    // Pencil tip
    g.appendChild(
      rc.linearPath(
        [
          [s * 0.7, s * 0.3],
          [s * 0.85, s * 0.15],
          [s * 0.8, s * 0.2],
        ],
        { ...opts, seed: seed + 1 }
      )
    )
    // Eraser end
    g.appendChild(rc.line(s * 0.15, s * 0.75, s * 0.25, s * 0.85, { ...opts, seed: seed + 2 }))
    return g
  },

  delete: (rc, size, color, strokeWidth, roughness, seed) => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g")
    const opts = { roughness, stroke: color, strokeWidth, seed }
    const s = size

    // Trash can lid
    g.appendChild(rc.line(s * 0.2, s * 0.25, s * 0.8, s * 0.25, opts))
    // Handle
    g.appendChild(
      rc.arc(s * 0.5, s * 0.25, s * 0.2, s * 0.15, Math.PI, 0, false, { ...opts, seed: seed + 1 })
    )
    // Can body
    g.appendChild(
      rc.linearPath(
        [
          [s * 0.25, s * 0.25],
          [s * 0.3, s * 0.85],
          [s * 0.7, s * 0.85],
          [s * 0.75, s * 0.25],
        ],
        { ...opts, seed: seed + 2 }
      )
    )
    return g
  },

  copy: (rc, size, color, strokeWidth, roughness, seed) => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g")
    const opts = { roughness, stroke: color, strokeWidth, seed }
    const s = size

    // Back rectangle
    g.appendChild(rc.rectangle(s * 0.15, s * 0.15, s * 0.5, s * 0.55, opts))
    // Front rectangle
    g.appendChild(rc.rectangle(s * 0.35, s * 0.35, s * 0.5, s * 0.55, { ...opts, seed: seed + 1 }))
    return g
  },

  check: (rc, size, color, strokeWidth, roughness, seed) => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g")
    const opts = { roughness, stroke: color, strokeWidth, seed }
    const s = size

    g.appendChild(
      rc.linearPath(
        [
          [s * 0.15, s * 0.5],
          [s * 0.4, s * 0.75],
          [s * 0.85, s * 0.25],
        ],
        opts
      )
    )
    return g
  },

  x: (rc, size, color, strokeWidth, roughness, seed) => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g")
    const opts = { roughness, stroke: color, strokeWidth, seed }
    const s = size

    g.appendChild(rc.line(s * 0.2, s * 0.2, s * 0.8, s * 0.8, opts))
    g.appendChild(rc.line(s * 0.8, s * 0.2, s * 0.2, s * 0.8, { ...opts, seed: seed + 1 }))
    return g
  },

  search: (rc, size, color, strokeWidth, roughness, seed) => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g")
    const opts = { roughness, stroke: color, strokeWidth, seed }
    const s = size

    // Magnifying glass circle
    g.appendChild(rc.circle(s * 0.42, s * 0.42, s * 0.35, opts))
    // Handle
    g.appendChild(rc.line(s * 0.62, s * 0.62, s * 0.88, s * 0.88, { ...opts, seed: seed + 1 }))
    return g
  },

  refresh: (rc, size, color, strokeWidth, roughness, seed) => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g")
    const opts = { roughness, stroke: color, strokeWidth, seed }
    const s = size

    // Circular arrow
    g.appendChild(
      rc.arc(s * 0.5, s * 0.5, s * 0.5, s * 0.5, 0, Math.PI * 1.5, false, opts)
    )
    // Arrow head
    g.appendChild(
      rc.linearPath(
        [
          [s * 0.5, s * 0.15],
          [s * 0.5, s * 0.3],
          [s * 0.65, s * 0.22],
        ],
        { ...opts, seed: seed + 1 }
      )
    )
    return g
  },

  "arrow-left": (rc, size, color, strokeWidth, roughness, seed) => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g")
    const opts = { roughness, stroke: color, strokeWidth, seed }
    const s = size

    // Arrow shaft
    g.appendChild(rc.line(s * 0.2, s * 0.5, s * 0.8, s * 0.5, opts))
    // Arrow head
    g.appendChild(rc.line(s * 0.2, s * 0.5, s * 0.4, s * 0.3, { ...opts, seed: seed + 1 }))
    g.appendChild(rc.line(s * 0.2, s * 0.5, s * 0.4, s * 0.7, { ...opts, seed: seed + 2 }))
    return g
  },

  "arrow-right": (rc, size, color, strokeWidth, roughness, seed) => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g")
    const opts = { roughness, stroke: color, strokeWidth, seed }
    const s = size

    // Arrow shaft
    g.appendChild(rc.line(s * 0.2, s * 0.5, s * 0.8, s * 0.5, opts))
    // Arrow head
    g.appendChild(rc.line(s * 0.8, s * 0.5, s * 0.6, s * 0.3, { ...opts, seed: seed + 1 }))
    g.appendChild(rc.line(s * 0.8, s * 0.5, s * 0.6, s * 0.7, { ...opts, seed: seed + 2 }))
    return g
  },

  message: (rc, size, color, strokeWidth, roughness, seed) => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g")
    const opts = { roughness, stroke: color, strokeWidth, seed }
    const s = size

    // Chat bubble body
    g.appendChild(rc.rectangle(s * 0.12, s * 0.15, s * 0.76, s * 0.52, opts))
    // Tail/pointer at bottom
    g.appendChild(
      rc.linearPath(
        [
          [s * 0.25, s * 0.67],
          [s * 0.18, s * 0.82],
          [s * 0.42, s * 0.67],
        ],
        { ...opts, seed: seed + 1 }
      )
    )
    // Three dots inside
    g.appendChild(rc.circle(s * 0.35, s * 0.4, s * 0.06, { ...opts, seed: seed + 2 }))
    g.appendChild(rc.circle(s * 0.5, s * 0.4, s * 0.06, { ...opts, seed: seed + 3 }))
    g.appendChild(rc.circle(s * 0.65, s * 0.4, s * 0.06, { ...opts, seed: seed + 4 }))
    return g
  },

  "help-circle": (rc, size, color, strokeWidth, roughness, seed) => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g")
    const opts = { roughness, stroke: color, strokeWidth, seed }
    const s = size

    // Outer circle
    g.appendChild(rc.circle(s * 0.5, s * 0.5, s * 0.7, opts))
    // Question mark curve
    g.appendChild(
      rc.arc(s * 0.5, s * 0.38, s * 0.2, s * 0.2, Math.PI, Math.PI * 0.1, false, {
        ...opts,
        seed: seed + 1,
      })
    )
    // Question mark stem
    g.appendChild(rc.line(s * 0.5, s * 0.48, s * 0.5, s * 0.56, { ...opts, seed: seed + 2 }))
    // Question mark dot
    g.appendChild(rc.circle(s * 0.5, s * 0.68, s * 0.05, { ...opts, seed: seed + 3 }))
    return g
  },

  headset: (rc, size, color, strokeWidth, roughness, seed) => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g")
    const opts = { roughness, stroke: color, strokeWidth, seed }
    const s = size

    // Life ring / lifebuoy - simple and universally recognized "help" symbol
    
    // Outer circle
    g.appendChild(rc.circle(s * 0.5, s * 0.5, s * 0.7, opts))
    
    // Inner circle (the hole in the middle)
    g.appendChild(rc.circle(s * 0.5, s * 0.5, s * 0.3, { ...opts, seed: seed + 1 }))

    // Four rope segments crossing through (at 45° angles for visual interest)
    // Top-right segment
    g.appendChild(rc.line(s * 0.62, s * 0.22, s * 0.78, s * 0.38, { ...opts, seed: seed + 2 }))
    // Bottom-right segment  
    g.appendChild(rc.line(s * 0.78, s * 0.62, s * 0.62, s * 0.78, { ...opts, seed: seed + 3 }))
    // Bottom-left segment
    g.appendChild(rc.line(s * 0.38, s * 0.78, s * 0.22, s * 0.62, { ...opts, seed: seed + 4 }))
    // Top-left segment
    g.appendChild(rc.line(s * 0.22, s * 0.38, s * 0.38, s * 0.22, { ...opts, seed: seed + 5 }))

    return g
  },

  star: (rc, size, color, strokeWidth, roughness, seed) => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g")
    const opts = { roughness, stroke: color, strokeWidth, seed }
    const s = size

    // 5-pointed star outline
    const cx = s * 0.5
    const cy = s * 0.5
    const outerR = s * 0.4
    const innerR = s * 0.18
    const points: Array<[number, number]> = []

    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? outerR : innerR
      const angle = (i * Math.PI) / 5 - Math.PI / 2
      points.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)])
    }
    points.push(points[0]) // Close the path

    g.appendChild(rc.linearPath(points, opts))
    return g
  },

  "star-filled": (rc, size, color, strokeWidth, roughness, seed) => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g")
    const s = size

    // 5-pointed star with fill
    const cx = s * 0.5
    const cy = s * 0.5
    const outerR = s * 0.4
    const innerR = s * 0.18
    const points: Array<[number, number]> = []

    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? outerR : innerR
      const angle = (i * Math.PI) / 5 - Math.PI / 2
      points.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)])
    }
    points.push(points[0]) // Close the path

    g.appendChild(
      rc.polygon(points, {
        roughness,
        stroke: color,
        strokeWidth,
        seed,
        fill: color,
        fillStyle: "solid",
      })
    )
    return g
  },
}

export function ScribbleIcon({
  name,
  size = 20,
  color = "default",
  strokeWidth = 1.5,
  roughness = 1,
  seed = 42,
  className,
}: ScribbleIconProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  // Memoize the computed color
  const computedColor = useMemo(() => getColor(color), [color])

  useEffect(() => {
    if (!svgRef.current) return

    const svg = svgRef.current
    while (svg.firstChild) svg.removeChild(svg.firstChild)

    const rc = rough.svg(svg)
    const drawer = iconDrawers[name]

    const iconGroup = drawer(rc, size, computedColor, strokeWidth, roughness, seed)
    svg.appendChild(iconGroup)
  }, [name, size, computedColor, strokeWidth, roughness, seed])

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      style={{ overflow: "visible" }}
      aria-hidden="true"
    />
  )
}
