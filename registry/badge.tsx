/**
 * ScribbleBadge - Pill-shaped badge with sketchy Rough.js border
 *
 * Like shadcn/ui Badge but with hand-drawn aesthetic.
 * Uses subtle roughness for readable status indicators.
 */

import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import rough from "roughjs"

import { cn } from "./lib/utils"

// =============================================================================
// TYPES
// =============================================================================

export type BadgeVariant =
  | "default"
  | "secondary"
  | "success"
  | "warning"
  | "destructive"
  | "outline"

export interface ScribbleBadgeProps {
  children: ReactNode
  /** Visual variant */
  variant?: BadgeVariant
  /** Seed for consistent randomness */
  seed?: number
  /** Additional class names */
  className?: string
}

// =============================================================================
// VARIANT STYLES
// =============================================================================

interface VariantStyle {
  fill: string
  stroke: string
  textClass: string
}

const variantStyles: Record<BadgeVariant, VariantStyle> = {
  default: {
    fill: "#f3f4f6",
    stroke: "#9ca3af",
    textClass: "text-gray-700 dark:text-gray-300",
  },
  secondary: {
    fill: "#dbeafe",
    stroke: "#3b82f6",
    textClass: "text-blue-700 dark:text-blue-300",
  },
  success: {
    fill: "#d1fae5",
    stroke: "#059669",
    textClass: "text-green-700 dark:text-green-300",
  },
  warning: {
    fill: "#fef3c7",
    stroke: "#d97706",
    textClass: "text-amber-700 dark:text-amber-300",
  },
  destructive: {
    fill: "#fee2e2",
    stroke: "#dc2626",
    textClass: "text-red-700 dark:text-red-300",
  },
  outline: {
    fill: "transparent",
    stroke: "#9ca3af",
    textClass: "text-gray-700 dark:text-gray-300",
  },
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ScribbleBadge({
  children,
  variant = "default",
  seed = 42,
  className,
}: ScribbleBadgeProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLSpanElement>(null)
  const [dims, setDims] = useState({ width: 0, height: 0 })

  const styles = variantStyles[variant]

  // Measure container
  useEffect(() => {
    if (!containerRef.current) return

    const measure = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      setDims({ width: rect.width, height: rect.height })
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  // Draw sketchy pill shape
  useEffect(() => {
    if (!svgRef.current || dims.width === 0) return

    const svg = svgRef.current
    while (svg.firstChild) svg.removeChild(svg.firstChild)

    const rc = rough.svg(svg)
    const padding = 1
    const { width, height } = dims

    // Draw filled background (pill shape via rounded rectangle)
    if (styles.fill !== "transparent") {
      const bg = rc.rectangle(padding, padding, width - padding * 2, height - padding * 2, {
        roughness: 0.4,
        bowing: 0.5,
        stroke: "none",
        fill: styles.fill,
        fillStyle: "solid",
        seed,
      })
      svg.appendChild(bg)
    }

    // Draw sketchy border
    const border = rc.rectangle(padding, padding, width - padding * 2, height - padding * 2, {
      roughness: 0.6,
      bowing: 0.5,
      stroke: styles.stroke,
      strokeWidth: 1.5,
      seed: seed + 1,
    })
    svg.appendChild(border)
  }, [dims, styles, seed])

  return (
    <span
      ref={containerRef}
      className={cn(
        "relative inline-flex items-center justify-center",
        "px-2.5 py-0.5 text-xs font-medium",
        "font-handwriting",
        className
      )}
    >
      {/* Rough.js SVG layer */}
      <svg
        ref={svgRef}
        className="pointer-events-none absolute inset-0"
        width={dims.width || "100%"}
        height={dims.height || "100%"}
        style={{ overflow: "visible" }}
      />

      {/* Text content */}
      <span className={cn("relative z-10", styles.textClass)}>{children}</span>
    </span>
  )
}
