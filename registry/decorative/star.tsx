/**
 * ScribbleStar - Hand-drawn star shape
 */

import { useEffect, useRef } from "react"
import rough from "roughjs"
import { cn } from "../lib/utils"

export interface ScribbleStarProps {
  /** Size in pixels */
  size?: number
  /** Stroke color */
  color?: "accent" | "muted" | "warning" | string
  /** Fill color (optional) */
  fill?: string
  /** Number of points (default 5) */
  points?: number
  /** Roughness level */
  roughness?: number
  /** Seed for consistent randomness */
  seed?: number
  /** Additional class names */
  className?: string
}

const colorMap: Record<string, string> = {
  accent: "var(--scribble-stroke-accent)",
  muted: "var(--scribble-stroke-muted)",
  warning: "var(--scribble-stroke-warning)",
}

function getColor(color: string): string {
  if (color in colorMap) {
    if (typeof window !== "undefined") {
      const varName = colorMap[color].slice(4, -1)
      return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || "#e07a5f"
    }
    return "#e07a5f"
  }
  return color
}

export function ScribbleStar({
  size = 24,
  color = "accent",
  fill,
  points = 5,
  roughness = 1.2,
  seed = 42,
  className,
}: ScribbleStarProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    const svg = svgRef.current
    while (svg.firstChild) svg.removeChild(svg.firstChild)

    const rc = rough.svg(svg)
    const cx = size / 2
    const cy = size / 2
    const outerR = size / 2 - 2
    const innerR = outerR * 0.4

    // Generate star points
    const starPoints: Array<[number, number]> = []
    for (let i = 0; i < points * 2; i++) {
      const angle = (Math.PI / points) * i - Math.PI / 2
      const r = i % 2 === 0 ? outerR : innerR
      starPoints.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)])
    }

    const computedColor = getColor(color)
    const star = rc.polygon(starPoints, {
      roughness,
      stroke: computedColor,
      strokeWidth: 1.5,
      fill: fill,
      fillStyle: fill ? "solid" : undefined,
      seed,
    })
    svg.appendChild(star)
  }, [size, color, fill, points, roughness, seed])

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      className={cn("inline-block", className)}
      style={{ overflow: "visible" }}
    />
  )
}

