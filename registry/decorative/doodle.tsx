/**
 * ScribbleDoodle - Hand-drawn doodle icons
 * 
 * A collection of hand-drawn icons for decoration.
 * Basic types: clock, stairs, calendar, target, sun, lightbulb, trophy, pencil
 * Elaborate types: sun-happy, lightbulb-glow, trophy-confetti, star-cluster, pencil-horizontal
 */

import { useEffect, useRef } from "react"
import rough from "roughjs"
import { cn } from "./lib/utils"

export type DoodleType = 
  // Basic doodles
  | "clock" 
  | "stairs" 
  | "calendar" 
  | "target" 
  | "sun" 
  | "lightbulb" 
  | "trophy"
  | "pencil"
  | "home"            // House icon (for family org type)
  | "school"          // School building (for school org type)
  // Elaborate doodles (for testimonials, feature sections)
  | "sun-happy"       // Sun with smiley face and floating hearts
  | "lightbulb-glow"  // Lightbulb with sparkle rays
  | "trophy-confetti" // Trophy with confetti celebration
  | "star-cluster"    // Magic star cluster with sparkles
  | "pencil-horizontal" // Horizontal pencil (for footer decorations)

export interface ScribbleDoodleProps {
  /** Type of doodle to draw */
  type: DoodleType
  /** Size in pixels */
  size?: number
  /** Primary color */
  color?: "muted" | "accent" | string
  /** Accent color (for highlights) */
  accentColor?: string
  /** Roughness level */
  roughness?: number
  /** Seed for consistent randomness */
  seed?: number
  /** Additional class names */
  className?: string
}

const colorMap: Record<string, string> = {
  muted: "#888",
  accent: "var(--scribble-stroke-accent)",
}

function getColor(color: string): string {
  if (color in colorMap) {
    if (color === "accent" && typeof window !== "undefined") {
      return getComputedStyle(document.documentElement)
        .getPropertyValue("--scribble-stroke-accent").trim() || "#e07a5f"
    }
    return colorMap[color]
  }
  return color
}

export function ScribbleDoodle({
  type,
  size = 48,
  color = "muted",
  accentColor = "#e07a5f",
  roughness = 1.2,
  seed = 1,
  className,
}: ScribbleDoodleProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  
  // Determine if this is an elaborate doodle that needs more space
  const isElaborate = type.includes("-") || type === "star-cluster"
  const displaySize = isElaborate ? size * 1.6 : size

  useEffect(() => {
    if (!svgRef.current) return

    const svg = svgRef.current
    while (svg.firstChild) svg.removeChild(svg.firstChild)

    const rc = rough.svg(svg)
    const strokeColor = getColor(color)
    const scale = size / 48
    const cx = displaySize / 2
    const cy = displaySize / 2
    
    switch (type) {
      // ===== BASIC DOODLES =====
      case "clock": {
        const face = rc.circle(24 * scale, 24 * scale, 40 * scale, { 
          roughness, stroke: strokeColor, strokeWidth: 1.5, seed 
        })
        const hand1 = rc.line(24 * scale, 24 * scale, 24 * scale, 10 * scale, { 
          roughness: 0.8, stroke: strokeColor, strokeWidth: 2, seed: seed + 1 
        })
        const hand2 = rc.line(24 * scale, 24 * scale, 34 * scale, 24 * scale, { 
          roughness: 0.8, stroke: strokeColor, strokeWidth: 2, seed: seed + 2 
        })
        const center = rc.circle(24 * scale, 24 * scale, 4 * scale, { 
          roughness: 0.5, stroke: strokeColor, fill: strokeColor, fillStyle: "solid", seed: seed + 3 
        })
        svg.appendChild(face)
        svg.appendChild(hand1)
        svg.appendChild(hand2)
        svg.appendChild(center)
        break
      }
      case "stairs": {
        const steps = [
          [8, 40, 18, 40], [18, 40, 18, 30], [18, 30, 28, 30],
          [28, 30, 28, 20], [28, 20, 38, 20], [38, 20, 38, 10], [38, 10, 44, 10],
        ]
        steps.forEach(([x1, y1, x2, y2], i) => {
          const step = rc.line(x1 * scale, y1 * scale, x2 * scale, y2 * scale, {
            roughness: 1, stroke: strokeColor, strokeWidth: 2, seed: seed + i
          })
          svg.appendChild(step)
        })
        break
      }
      case "calendar": {
        const outline = rc.rectangle(4 * scale, 8 * scale, 40 * scale, 36 * scale, { 
          roughness: 1, stroke: strokeColor, strokeWidth: 1.5, seed 
        })
        const header = rc.line(4 * scale, 16 * scale, 44 * scale, 16 * scale, { 
          roughness: 0.8, stroke: strokeColor, strokeWidth: 1.5, seed: seed + 1 
        })
        const ring1 = rc.line(14 * scale, 4 * scale, 14 * scale, 12 * scale, { 
          roughness: 0.5, stroke: strokeColor, strokeWidth: 2, seed: seed + 2 
        })
        const ring2 = rc.line(34 * scale, 4 * scale, 34 * scale, 12 * scale, { 
          roughness: 0.5, stroke: strokeColor, strokeWidth: 2, seed: seed + 3 
        })
        const checks = ["M 10 24 L 14 28 L 20 20", "M 28 30 L 32 34 L 38 26", "M 10 36 L 14 40 L 20 32"]
        svg.appendChild(outline)
        svg.appendChild(header)
        svg.appendChild(ring1)
        svg.appendChild(ring2)
        checks.forEach((path, i) => {
          const scaledPath = path.replace(/(\d+)/g, (m) => String(Number(m) * scale))
          svg.appendChild(rc.path(scaledPath, { roughness: 0.8, stroke: accentColor, strokeWidth: 2, seed: seed + 4 + i }))
        })
        break
      }
      case "target": {
        svg.appendChild(rc.circle(24 * scale, 24 * scale, 40 * scale, { roughness: 1, stroke: strokeColor, strokeWidth: 1.5, seed }))
        svg.appendChild(rc.circle(24 * scale, 24 * scale, 26 * scale, { roughness: 1, stroke: strokeColor, strokeWidth: 1.5, seed: seed + 1 }))
        svg.appendChild(rc.circle(24 * scale, 24 * scale, 12 * scale, { roughness: 0.8, stroke: accentColor, strokeWidth: 2, seed: seed + 2 }))
        svg.appendChild(rc.circle(24 * scale, 24 * scale, 4 * scale, { roughness: 0.5, fill: accentColor, fillStyle: "solid", seed: seed + 3 }))
        break
      }
      case "sun": {
        svg.appendChild(rc.circle(24 * scale, 24 * scale, 20 * scale, { roughness: 1.2, stroke: "#f59e0b", strokeWidth: 2, fill: "#fbbf24", fillStyle: "solid", seed }))
        for (let i = 0; i < 8; i++) {
          const angle = (Math.PI / 4) * i
          svg.appendChild(rc.line(
            24 * scale + Math.cos(angle) * 14 * scale, 24 * scale + Math.sin(angle) * 14 * scale,
            24 * scale + Math.cos(angle) * 22 * scale, 24 * scale + Math.sin(angle) * 22 * scale,
            { roughness: 0.8, stroke: "#f59e0b", strokeWidth: 2, seed: seed + i + 1 }
          ))
        }
        break
      }
      case "lightbulb": {
        for (let i = 0; i < 3; i++) {
          const angle = -Math.PI / 4 + (Math.PI / 4) * i
          svg.appendChild(rc.line(
            24 * scale + Math.cos(angle) * 16 * scale, 18 * scale + Math.sin(angle) * 16 * scale,
            24 * scale + Math.cos(angle) * 22 * scale, 18 * scale + Math.sin(angle) * 22 * scale,
            { roughness: 0.6, stroke: "#f59e0b", strokeWidth: 1.5, seed: seed + 4 + i }
          ))
        }
        svg.appendChild(rc.circle(24 * scale, 18 * scale, 24 * scale, { roughness: 1.2, stroke: "#f59e0b", strokeWidth: 2, fill: "#fef3c7", fillStyle: "solid", seed }))
        svg.appendChild(rc.line(16 * scale, 30 * scale, 32 * scale, 30 * scale, { roughness: 0.8, stroke: strokeColor, strokeWidth: 2, seed: seed + 1 }))
        svg.appendChild(rc.line(18 * scale, 34 * scale, 30 * scale, 34 * scale, { roughness: 0.8, stroke: strokeColor, strokeWidth: 2, seed: seed + 2 }))
        svg.appendChild(rc.line(20 * scale, 38 * scale, 28 * scale, 38 * scale, { roughness: 0.8, stroke: strokeColor, strokeWidth: 2, seed: seed + 3 }))
        break
      }
      case "trophy": {
        svg.appendChild(rc.path(`M ${12 * scale} ${8 * scale} L ${12 * scale} ${24 * scale} Q ${24 * scale} ${32 * scale} ${36 * scale} ${24 * scale} L ${36 * scale} ${8 * scale} Z`, { roughness: 1.2, stroke: "#f59e0b", strokeWidth: 2, fill: "#fef3c7", fillStyle: "solid", seed }))
        svg.appendChild(rc.path(`M ${12 * scale} ${12 * scale} Q ${4 * scale} ${12 * scale} ${4 * scale} ${18 * scale} Q ${4 * scale} ${24 * scale} ${12 * scale} ${24 * scale}`, { roughness: 1, stroke: "#f59e0b", strokeWidth: 2, seed: seed + 1 }))
        svg.appendChild(rc.path(`M ${36 * scale} ${12 * scale} Q ${44 * scale} ${12 * scale} ${44 * scale} ${18 * scale} Q ${44 * scale} ${24 * scale} ${36 * scale} ${24 * scale}`, { roughness: 1, stroke: "#f59e0b", strokeWidth: 2, seed: seed + 2 }))
        svg.appendChild(rc.line(24 * scale, 32 * scale, 24 * scale, 40 * scale, { roughness: 0.8, stroke: "#f59e0b", strokeWidth: 2, seed: seed + 3 }))
        svg.appendChild(rc.line(16 * scale, 40 * scale, 32 * scale, 40 * scale, { roughness: 0.8, stroke: "#f59e0b", strokeWidth: 3, seed: seed + 4 }))
        break
      }
      case "pencil": {
        svg.appendChild(rc.polygon([[8 * scale, 40 * scale], [12 * scale, 8 * scale], [20 * scale, 8 * scale], [16 * scale, 40 * scale]], { roughness: 1.2, stroke: strokeColor, strokeWidth: 1.5, fill: "#fef3c7", fillStyle: "solid", seed }))
        svg.appendChild(rc.polygon([[8 * scale, 40 * scale], [16 * scale, 40 * scale], [12 * scale, 48 * scale]], { roughness: 1, stroke: strokeColor, strokeWidth: 1.5, fill: "#f5d0a9", fillStyle: "solid", seed: seed + 1 }))
        svg.appendChild(rc.rectangle(10 * scale, 4 * scale, 12 * scale, 6 * scale, { roughness: 0.8, stroke: strokeColor, strokeWidth: 1.5, fill: "#fca5a5", fillStyle: "solid", seed: seed + 2 }))
        break
      }
      case "home": {
        // House with triangular roof
        // Roof (triangle)
        svg.appendChild(rc.polygon([
          [24 * scale, 6 * scale],   // Peak
          [6 * scale, 22 * scale],   // Left eave
          [42 * scale, 22 * scale],  // Right eave
        ], { roughness: 1.2, stroke: strokeColor, strokeWidth: 2, fill: "#fca5a5", fillStyle: "solid", seed }))
        // House body
        svg.appendChild(rc.rectangle(10 * scale, 22 * scale, 28 * scale, 22 * scale, { 
          roughness: 1.2, stroke: strokeColor, strokeWidth: 2, fill: "#fef3c7", fillStyle: "solid", seed: seed + 1 
        }))
        // Door
        svg.appendChild(rc.rectangle(20 * scale, 30 * scale, 8 * scale, 14 * scale, { 
          roughness: 1, stroke: strokeColor, strokeWidth: 1.5, fill: accentColor, fillStyle: "solid", seed: seed + 2 
        }))
        // Door knob
        svg.appendChild(rc.circle(26 * scale, 37 * scale, 2 * scale, { 
          roughness: 0.5, stroke: strokeColor, strokeWidth: 1, fill: "#fbbf24", fillStyle: "solid", seed: seed + 3 
        }))
        // Window
        svg.appendChild(rc.rectangle(12 * scale, 26 * scale, 6 * scale, 6 * scale, { 
          roughness: 0.8, stroke: strokeColor, strokeWidth: 1.5, fill: "#bfdbfe", fillStyle: "solid", seed: seed + 4 
        }))
        // Window cross
        svg.appendChild(rc.line(15 * scale, 26 * scale, 15 * scale, 32 * scale, { roughness: 0.5, stroke: strokeColor, strokeWidth: 1, seed: seed + 5 }))
        svg.appendChild(rc.line(12 * scale, 29 * scale, 18 * scale, 29 * scale, { roughness: 0.5, stroke: strokeColor, strokeWidth: 1, seed: seed + 6 }))
        // Chimney
        svg.appendChild(rc.rectangle(32 * scale, 10 * scale, 6 * scale, 10 * scale, { 
          roughness: 1, stroke: strokeColor, strokeWidth: 1.5, fill: "#d1d5db", fillStyle: "solid", seed: seed + 7 
        }))
        break
      }
      case "school": {
        // School building with clock and flag
        // Main building body
        svg.appendChild(rc.rectangle(6 * scale, 18 * scale, 36 * scale, 26 * scale, { 
          roughness: 1.2, stroke: strokeColor, strokeWidth: 2, fill: "#fef3c7", fillStyle: "solid", seed 
        }))
        // Roof/top section
        svg.appendChild(rc.rectangle(6 * scale, 14 * scale, 36 * scale, 6 * scale, { 
          roughness: 1, stroke: strokeColor, strokeWidth: 1.5, fill: accentColor, fillStyle: "solid", seed: seed + 1 
        }))
        // Central entrance pediment (triangle)
        svg.appendChild(rc.polygon([
          [24 * scale, 6 * scale],   // Peak
          [16 * scale, 14 * scale],  // Left
          [32 * scale, 14 * scale],  // Right
        ], { roughness: 1, stroke: strokeColor, strokeWidth: 1.5, fill: "#fef3c7", fillStyle: "solid", seed: seed + 2 }))
        // Clock circle on pediment
        svg.appendChild(rc.circle(24 * scale, 10 * scale, 5 * scale, { 
          roughness: 0.8, stroke: strokeColor, strokeWidth: 1.5, fill: "#fff", fillStyle: "solid", seed: seed + 3 
        }))
        // Clock hands
        svg.appendChild(rc.line(24 * scale, 10 * scale, 24 * scale, 8 * scale, { roughness: 0.5, stroke: strokeColor, strokeWidth: 1.5, seed: seed + 4 }))
        svg.appendChild(rc.line(24 * scale, 10 * scale, 26 * scale, 10 * scale, { roughness: 0.5, stroke: strokeColor, strokeWidth: 1.5, seed: seed + 5 }))
        // Door
        svg.appendChild(rc.rectangle(20 * scale, 32 * scale, 8 * scale, 12 * scale, { 
          roughness: 1, stroke: strokeColor, strokeWidth: 1.5, fill: "#92400e", fillStyle: "solid", seed: seed + 6 
        }))
        // Windows row (left)
        svg.appendChild(rc.rectangle(9 * scale, 22 * scale, 5 * scale, 6 * scale, { 
          roughness: 0.8, stroke: strokeColor, strokeWidth: 1, fill: "#bfdbfe", fillStyle: "solid", seed: seed + 7 
        }))
        svg.appendChild(rc.rectangle(9 * scale, 32 * scale, 5 * scale, 6 * scale, { 
          roughness: 0.8, stroke: strokeColor, strokeWidth: 1, fill: "#bfdbfe", fillStyle: "solid", seed: seed + 8 
        }))
        // Windows row (right)
        svg.appendChild(rc.rectangle(34 * scale, 22 * scale, 5 * scale, 6 * scale, { 
          roughness: 0.8, stroke: strokeColor, strokeWidth: 1, fill: "#bfdbfe", fillStyle: "solid", seed: seed + 9 
        }))
        svg.appendChild(rc.rectangle(34 * scale, 32 * scale, 5 * scale, 6 * scale, { 
          roughness: 0.8, stroke: strokeColor, strokeWidth: 1, fill: "#bfdbfe", fillStyle: "solid", seed: seed + 10 
        }))
        // Flag pole
        svg.appendChild(rc.line(24 * scale, 2 * scale, 24 * scale, 6 * scale, { roughness: 0.5, stroke: strokeColor, strokeWidth: 1.5, seed: seed + 11 }))
        // Flag
        svg.appendChild(rc.polygon([
          [24 * scale, 2 * scale],
          [30 * scale, 3.5 * scale],
          [24 * scale, 5 * scale],
        ], { roughness: 0.8, stroke: "#ef4444", strokeWidth: 1, fill: "#ef4444", fillStyle: "solid", seed: seed + 12 }))
        break
      }

      // ===== ELABORATE DOODLES =====
      case "sun-happy": {
        // Sun with smiley face and floating hearts
        svg.appendChild(rc.circle(cx, cy, 28, { roughness: 1.2, stroke: "#f59e0b", strokeWidth: 2, fill: "#fbbf24", fillStyle: "solid", seed }))
        // Wavy rays
        const rayAngles = [0, 45, 90, 135, 180, 225, 270, 315]
        rayAngles.forEach((angle, i) => {
          const rad = (angle * Math.PI) / 180
          const wobble = i % 2 === 0 ? 2 : -2
          svg.appendChild(rc.line(
            cx + 16 * Math.cos(rad), cy + 16 * Math.sin(rad),
            cx + 24 * Math.cos(rad) + wobble, cy + 24 * Math.sin(rad) + wobble,
            { roughness: 1.5, stroke: "#f59e0b", strokeWidth: 2.5, seed: seed + i + 10 }
          ))
        })
        // Eyes
        svg.appendChild(rc.circle(cx - 5, cy - 3, 3, { roughness: 0.8, stroke: "#92400e", strokeWidth: 1.5, fill: "#92400e", fillStyle: "solid", seed: seed + 20 }))
        svg.appendChild(rc.circle(cx + 5, cy - 3, 3, { roughness: 0.8, stroke: "#92400e", strokeWidth: 1.5, fill: "#92400e", fillStyle: "solid", seed: seed + 21 }))
        // Smile
        svg.appendChild(rc.arc(cx, cy + 1, 10, 8, 0.2, Math.PI - 0.2, false, { roughness: 1, stroke: "#92400e", strokeWidth: 1.5, seed: seed + 22 }))
        // Floating hearts
        const hearts = [{ x: cx - 22, y: cy - 18 }, { x: cx + 20, y: cy - 22 }, { x: cx + 24, y: cy + 12 }]
        hearts.forEach((pos, i) => {
          svg.appendChild(rc.path(
            `M ${pos.x} ${pos.y + 2} C ${pos.x} ${pos.y}, ${pos.x - 3} ${pos.y - 1}, ${pos.x - 4} ${pos.y + 1} C ${pos.x - 5} ${pos.y + 3}, ${pos.x} ${pos.y + 6}, ${pos.x} ${pos.y + 6} C ${pos.x} ${pos.y + 6}, ${pos.x + 5} ${pos.y + 3}, ${pos.x + 4} ${pos.y + 1} C ${pos.x + 3} ${pos.y - 1}, ${pos.x} ${pos.y}, ${pos.x} ${pos.y + 2} Z`,
            { roughness: 0.8, stroke: "#ef4444", strokeWidth: 1, fill: "#fca5a5", fillStyle: "solid", seed: seed + 30 + i }
          ))
        })
        break
      }

      case "lightbulb-glow": {
        // Glowing lightbulb with sparkles
        svg.appendChild(rc.circle(cx, cy - 5, 24, { roughness: 1.2, stroke: "#fbbf24", strokeWidth: 2, fill: "#fef3c7", fillStyle: "solid", seed }))
        svg.appendChild(rc.rectangle(cx - 6, cy + 7, 12, 8, { roughness: 1, stroke: "#9ca3af", strokeWidth: 1.5, fill: "#d1d5db", fillStyle: "solid", seed: seed + 1 }))
        // Screw threads
        for (let i = 0; i < 3; i++) {
          svg.appendChild(rc.line(cx - 5, cy + 8 + i * 2.5, cx + 5, cy + 8 + i * 2.5, { roughness: 0.8, stroke: "#6b7280", strokeWidth: 1, seed: seed + 5 + i }))
        }
        // Filament
        svg.appendChild(rc.path(`M ${cx - 4} ${cy} Q ${cx} ${cy - 6}, ${cx + 4} ${cy}`, { roughness: 1.2, stroke: "#f59e0b", strokeWidth: 2, seed: seed + 10 }))
        // Sparkle rays
        const sparkles = [{ x: cx - 18, y: cy - 15, len: 6 }, { x: cx + 18, y: cy - 15, len: 6 }, { x: cx - 20, y: cy + 2, len: 5 }, { x: cx + 20, y: cy + 2, len: 5 }, { x: cx, y: cy - 22, len: 7 }]
        sparkles.forEach((sp, i) => {
          svg.appendChild(rc.line(sp.x, sp.y - sp.len / 2, sp.x, sp.y + sp.len / 2, { roughness: 0.6, stroke: "#fbbf24", strokeWidth: 1.5, seed: seed + 20 + i }))
          svg.appendChild(rc.line(sp.x - sp.len / 2, sp.y, sp.x + sp.len / 2, sp.y, { roughness: 0.6, stroke: "#fbbf24", strokeWidth: 1.5, seed: seed + 25 + i }))
        })
        break
      }

      case "trophy-confetti": {
        // Trophy with confetti
        svg.appendChild(rc.path(`M ${cx - 12} ${cy - 15} L ${cx - 10} ${cy + 5} Q ${cx} ${cy + 12}, ${cx + 10} ${cy + 5} L ${cx + 12} ${cy - 15} Q ${cx} ${cy - 10}, ${cx - 12} ${cy - 15} Z`, { roughness: 1.2, stroke: "#f59e0b", strokeWidth: 2, fill: "#fbbf24", fillStyle: "solid", seed }))
        svg.appendChild(rc.path(`M ${cx - 12} ${cy - 10} Q ${cx - 20} ${cy - 5}, ${cx - 12} ${cy}`, { roughness: 1.2, stroke: "#f59e0b", strokeWidth: 2, seed: seed + 1 }))
        svg.appendChild(rc.path(`M ${cx + 12} ${cy - 10} Q ${cx + 20} ${cy - 5}, ${cx + 12} ${cy}`, { roughness: 1.2, stroke: "#f59e0b", strokeWidth: 2, seed: seed + 2 }))
        svg.appendChild(rc.rectangle(cx - 3, cy + 8, 6, 8, { roughness: 1, stroke: "#d97706", strokeWidth: 1.5, fill: "#fbbf24", fillStyle: "solid", seed: seed + 3 }))
        svg.appendChild(rc.rectangle(cx - 8, cy + 15, 16, 4, { roughness: 1, stroke: "#d97706", strokeWidth: 1.5, fill: "#fbbf24", fillStyle: "solid", seed: seed + 4 }))
        // Star on trophy
        const starPts = drawStarPoints(cx, cy - 5, 5)
        svg.appendChild(rc.polygon(starPts, { roughness: 1, stroke: "#fff", strokeWidth: 1.5, fill: "#fff", fillStyle: "solid", seed: seed + 10 }))
        // Confetti
        const confettiColors = ["#ef4444", "#3b82f6", "#22c55e", "#a855f7", "#f59e0b"]
        const confetti = [{ x: cx - 22, y: cy - 20 }, { x: cx + 20, y: cy - 22 }, { x: cx - 18, y: cy - 8 }, { x: cx + 24, y: cy - 5 }, { x: cx - 25, y: cy + 5 }, { x: cx + 22, y: cy + 10 }, { x: cx - 5, y: cy - 25 }, { x: cx + 8, y: cy - 23 }]
        confetti.forEach((pos, i) => {
          const col = confettiColors[i % confettiColors.length]
          if (i % 3 === 0) svg.appendChild(rc.circle(pos.x, pos.y, 4, { roughness: 0.5, stroke: col, strokeWidth: 1, fill: col, fillStyle: "solid", seed: seed + 20 + i }))
          else if (i % 3 === 1) svg.appendChild(rc.path(`M ${pos.x} ${pos.y} Q ${pos.x + 3} ${pos.y - 3}, ${pos.x + 6} ${pos.y}`, { roughness: 1.5, stroke: col, strokeWidth: 2, seed: seed + 20 + i }))
          else svg.appendChild(rc.rectangle(pos.x - 2, pos.y - 1, 4, 2, { roughness: 0.8, stroke: col, strokeWidth: 1, fill: col, fillStyle: "solid", seed: seed + 20 + i }))
        })
        break
      }

      case "star-cluster": {
        // Big central star
        svg.appendChild(rc.polygon(drawStarPoints(cx, cy, 14), { roughness: 1, stroke: "#4ade80", strokeWidth: 1.5, fill: "#4ade80", fillStyle: "solid", seed }))
        // Medium stars
        const medStars = [{ x: cx - 18, y: cy - 12, size: 8, col: "#fbbf24" }, { x: cx + 16, y: cy - 15, size: 9, col: "#60a5fa" }, { x: cx + 20, y: cy + 10, size: 7, col: "#f472b6" }]
        medStars.forEach((st, i) => {
          svg.appendChild(rc.polygon(drawStarPoints(st.x, st.y, st.size), { roughness: 1, stroke: st.col, strokeWidth: 1.5, fill: st.col, fillStyle: "solid", seed: seed + 10 + i }))
        })
        // Sparkle dots
        const dots = [{ x: cx - 10, y: cy - 20 }, { x: cx + 8, y: cy - 22 }, { x: cx - 22, y: cy + 5 }, { x: cx + 25, y: cy - 2 }, { x: cx - 8, y: cy + 18 }, { x: cx + 12, y: cy + 16 }]
        dots.forEach((sp, i) => {
          svg.appendChild(rc.circle(sp.x, sp.y, 3, { roughness: 0.5, stroke: "#e5e7eb", strokeWidth: 1, fill: "#fff", fillStyle: "solid", seed: seed + 30 + i }))
        })
        // Swirls
        svg.appendChild(rc.path(`M ${cx - 25} ${cy - 5} Q ${cx - 20} ${cy - 15}, ${cx - 12} ${cy - 18}`, { roughness: 1.5, stroke: "#a855f7", strokeWidth: 1.5, seed: seed + 40 }))
        svg.appendChild(rc.path(`M ${cx + 25} ${cy + 5} Q ${cx + 18} ${cy + 15}, ${cx + 10} ${cy + 14}`, { roughness: 1.5, stroke: "#06b6d4", strokeWidth: 1.5, seed: seed + 41 }))
        break
      }

      case "pencil-horizontal": {
        // Horizontal pencil (for footer decorations)
        const w = size * 1.8
        const h = size * 0.6
        const py = h / 2
        // Body
        svg.appendChild(rc.polygon([[10, py], [w - 25, py - 5], [w - 22, py + 5], [12, py + 10]], { roughness: 1, stroke: "#888", strokeWidth: 1.5, fill: "#ffd93d", fillStyle: "solid", seed: 1 }))
        // Tip
        svg.appendChild(rc.polygon([[w - 25, py - 5], [w - 5, py], [w - 22, py + 5]], { roughness: 1, stroke: "#888", strokeWidth: 1.5, fill: "#f5e6c8", fillStyle: "solid", seed: 2 }))
        // Graphite
        svg.appendChild(rc.polygon([[w - 8, py - 1], [w, py], [w - 8, py + 1]], { roughness: 0.5, stroke: "#555", strokeWidth: 1, fill: "#333", fillStyle: "solid", seed: 3 }))
        // Eraser
        svg.appendChild(rc.polygon([[10, py], [0, py + 2], [2, py + 8], [12, py + 10]], { roughness: 1, stroke: "#888", strokeWidth: 1.5, fill: accentColor, fillStyle: "solid", seed: 4 }))
        // Metal band
        svg.appendChild(rc.line(10, py, 12, py + 10, { roughness: 0.8, stroke: "#aaa", strokeWidth: 2, seed: 5 }))
        break
      }
    }
  }, [type, size, displaySize, color, accentColor, roughness, seed])

  // Determine dimensions
  const width = type === "pencil-horizontal" ? size * 1.8 : displaySize
  const height = type === "pencil-horizontal" ? size * 0.6 : displaySize

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className={cn("inline-block", className)}
      style={{ overflow: "visible" }}
    />
  )
}

/** Helper: Generate 5-pointed star polygon points */
function drawStarPoints(cx: number, cy: number, size: number): Array<[number, number]> {
  const points: Array<[number, number]> = []
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? size : size * 0.4
    const angle = (Math.PI / 5) * i - Math.PI / 2
    points.push([cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)])
  }
  return points
}
