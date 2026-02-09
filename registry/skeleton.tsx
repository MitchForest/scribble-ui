/**
 * ScribbleSkeleton - Loading placeholder with hand-drawn aesthetic
 *
 * Features:
 * - Rough.js rectangle with hachure fill pattern
 * - Pulsing animation for loading indication
 * - Responsive via ResizeObserver
 * - Themed via CSS variables
 */

import { useEffect, useRef, useState } from "react"
import rough from "roughjs"

import { cn } from "./lib/utils"

export interface ScribbleSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Roughness level (default: 1.5) */
  roughness?: number
  /** Stroke color override */
  strokeColor?: string
  /** Fill color override */
  fillColor?: string
}

export function ScribbleSkeleton({
  className,
  roughness = 1.5,
  strokeColor,
  fillColor,
  ...props
}: ScribbleSkeletonProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dims, setDims] = useState({ width: 0, height: 0 })

  // ResizeObserver for dimension tracking
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

  // Draw rough rectangle with hachure fill
  useEffect(() => {
    if (!svgRef.current || dims.width === 0) return

    const svg = svgRef.current
    while (svg.firstChild) svg.removeChild(svg.firstChild)

    const rc = rough.svg(svg)

    // Resolve colors from CSS variables (same pattern as input.tsx)
    const styles = getComputedStyle(document.documentElement)
    const mutedStroke = styles.getPropertyValue("--scribble-stroke-muted").trim() || "#9ca3af"
    const mutedFill = styles.getPropertyValue("--scribble-fill-muted").trim() || "#f3f4f6"
    const stroke = strokeColor ?? mutedStroke
    const fill = fillColor ?? mutedFill

    const rect = rc.rectangle(2, 2, dims.width - 4, dims.height - 4, {
      roughness,
      stroke,
      strokeWidth: 1.5,
      fill,
      fillStyle: "hachure",
      fillWeight: 0.8,
      hachureGap: 6,
      hachureAngle: -41,
      seed: 42,
    })
    svg.appendChild(rect)
  }, [dims, roughness, strokeColor, fillColor])

  return (
    <div
      ref={containerRef}
      className={cn("relative animate-pulse", className)}
      {...props}
    >
      <svg
        ref={svgRef}
        className="pointer-events-none absolute inset-0"
        width={dims.width || "100%"}
        height={dims.height || "100%"}
        style={{ overflow: "visible" }}
      />
    </div>
  )
}
