/**
 * ScribbleProgress - Hand-drawn progress bar
 *
 * Features:
 * - Sketchy track outline
 * - Fill with hachure pattern
 * - Percentage label option
 * - Color variants (default, success, warning, error)
 */

import * as React from "react"
import { useCallback, useEffect, useRef } from "react"
import rough from "roughjs"
import { cn } from "./lib/utils"

// =============================================================================
// TYPES
// =============================================================================

type ProgressVariant = "default" | "success" | "warning" | "error"

interface ScribbleProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Progress value (0-100) */
  value?: number
  /** Show percentage label */
  showLabel?: boolean
  /** Color variant */
  variant?: ProgressVariant
  /** Height of the progress bar */
  size?: "sm" | "md" | "lg"
}

// =============================================================================
// VARIANT COLORS
// =============================================================================

const variantColors: Record<ProgressVariant, { stroke: string; fill: string }> = {
  default: {
    stroke: "var(--scribble-stroke-accent, #e07a5f)",
    fill: "var(--scribble-fill-primary, #fef3c7)",
  },
  success: {
    stroke: "var(--scribble-stroke-success, #059669)",
    fill: "var(--scribble-fill-success, #d1fae5)",
  },
  warning: {
    stroke: "var(--scribble-stroke-warning, #d97706)",
    fill: "var(--scribble-fill-warning, #fef3c7)",
  },
  error: {
    stroke: "var(--scribble-stroke-error, #dc2626)",
    fill: "var(--scribble-fill-error, #fee2e2)",
  },
}

const sizeClasses = {
  sm: "h-2",
  md: "h-3",
  lg: "h-4",
}

// =============================================================================
// COMPONENT
// =============================================================================

function ScribbleProgress({
  value = 0,
  showLabel = false,
  variant = "default",
  size = "md",
  className,
  ...props
}: ScribbleProgressProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const clampedValue = Math.min(100, Math.max(0, value))

  const draw = useCallback(() => {
    const container = containerRef.current
    const svg = svgRef.current
    if (!container || !svg) return

    const width = container.offsetWidth
    const height = container.offsetHeight
    if (width === 0 || height === 0) return

    svg.setAttribute("width", String(width))
    svg.setAttribute("height", String(height))

    // Clear previous drawings
    while (svg.firstChild) svg.removeChild(svg.firstChild)

    const rc = rough.svg(svg)
    const colors = variantColors[variant]
    const padding = 1
    const trackHeight = height - padding * 2

    // Draw track (background)
    const track = rc.rectangle(padding, padding, width - padding * 2, trackHeight, {
      roughness: 0.8,
      stroke: "var(--scribble-stroke-muted, #9ca3af)",
      strokeWidth: 1.5,
      fill: "var(--scribble-fill-muted, #f3f4f6)",
      fillStyle: "solid",
      seed: 42,
    })
    svg.appendChild(track)

    // Draw filled portion
    if (clampedValue > 0) {
      const fillWidth = ((width - padding * 2) * clampedValue) / 100
      const fill = rc.rectangle(padding, padding, fillWidth, trackHeight, {
        roughness: 1,
        stroke: colors.stroke,
        strokeWidth: 1.5,
        fill: colors.fill,
        fillStyle: "hachure",
        hachureAngle: -41,
        hachureGap: 4,
        seed: 43,
      })
      svg.appendChild(fill)
    }
  }, [clampedValue, variant])

  useEffect(() => {
    draw()

    // Redraw on resize
    const resizeObserver = new ResizeObserver(() => draw())
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => resizeObserver.disconnect()
  }, [draw])

  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      <div
        ref={containerRef}
        className={cn("relative flex-1 rounded-full overflow-hidden", sizeClasses[size])}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <svg
          ref={svgRef}
          className="absolute inset-0"
          style={{ overflow: "visible" }}
        />
      </div>
      {showLabel && (
        <span
          className="text-sm text-gray-600 dark:text-gray-400 min-w-[3ch] text-right"
          style={{ fontFamily: "var(--font-handwriting-body)" }}
        >
          {Math.round(clampedValue)}%
        </span>
      )}
    </div>
  )
}

export { ScribbleProgress }
export type { ScribbleProgressProps }
