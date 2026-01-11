/**
 * ScribblePlusMinus - Animated plus/minus icon for accordions
 */

import { useEffect, useRef } from "react"
import rough from "roughjs"

import { cn } from "../lib/utils"

export interface ScribblePlusMinusProps {
  /** Whether to show minus (open) or plus (closed) */
  isOpen: boolean
  /** Size in pixels */
  size?: number
  /** Color when open */
  openColor?: "accent" | string
  /** Color when closed */
  closedColor?: "muted" | string
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
}

function getColor(color: string): string {
  if (color in colorMap) {
    if (typeof window !== "undefined") {
      const varName = colorMap[color].slice(4, -1)
      return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || "#666"
    }
    return "#666"
  }
  return color
}

export function ScribblePlusMinus({
  isOpen,
  size = 24,
  openColor = "accent",
  closedColor = "muted",
  roughness = 1,
  seed = 42,
  className,
}: ScribblePlusMinusProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    const svg = svgRef.current
    while (svg.firstChild) svg.removeChild(svg.firstChild)

    const rc = rough.svg(svg)
    const center = size / 2
    const lineLength = size * 0.58
    const halfLine = lineLength / 2

    const computedColor = getColor(isOpen ? openColor : closedColor)

    // Horizontal line (always visible)
    const horizontal = rc.line(
      center - halfLine, center,
      center + halfLine, center,
      {
        roughness,
        stroke: computedColor,
        strokeWidth: 2.5,
        seed,
      }
    )
    svg.appendChild(horizontal)

    // Vertical line (only when closed)
    if (!isOpen) {
      const vertical = rc.line(
        center, center - halfLine,
        center, center + halfLine,
        {
          roughness,
          stroke: computedColor,
          strokeWidth: 2.5,
          seed: seed + 1,
        }
      )
      svg.appendChild(vertical)
    }
  }, [isOpen, size, openColor, closedColor, roughness, seed])

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      className={cn("shrink-0 transition-transform duration-200", className)}
      style={{ overflow: "visible" }}
    />
  )
}

