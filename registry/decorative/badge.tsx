/**
 * ScribbleBadge - Hand-drawn ellipse badge around content
 */

import { useEffect, useRef, useState } from "react"
import rough from "roughjs"
import type { ReactNode } from "react";
import { cn } from "../lib/utils"

export interface ScribbleBadgeProps {
  children: ReactNode
  /** Stroke color */
  color?: "accent" | "muted" | "success" | string
  /** Roughness level */
  roughness?: number
  /** Stroke width */
  strokeWidth?: number
  /** Seed for consistent randomness */
  seed?: number
  /** Additional class names */
  className?: string
  /** Additional inline styles */
  style?: React.CSSProperties
}

const colorMap: Record<string, string> = {
  accent: "var(--scribble-stroke-accent)",
  muted: "var(--scribble-stroke-muted)",
  success: "var(--scribble-stroke-success)",
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

export function ScribbleBadge({
  children,
  color = "accent",
  roughness = 1.5,
  strokeWidth = 2,
  seed = 123,
  className,
  style,
}: ScribbleBadgeProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dims, setDims] = useState({ width: 0, height: 0 })

  // ResizeObserver for dimension changes
  useEffect(() => {
    if (!containerRef.current) return
    
    const measure = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      setDims({ width: rect.width, height: rect.height })
    }
    
    measure()
    const observer = new ResizeObserver(() => measure())
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!svgRef.current || dims.width === 0) return

    const svg = svgRef.current
    while (svg.firstChild) svg.removeChild(svg.firstChild)

    const rc = rough.svg(svg)
    const computedColor = getColor(color)
    
    // Draw a hand-drawn ellipse around the content
    const ellipse = rc.ellipse(
      dims.width / 2,
      dims.height / 2,
      dims.width + 20,
      dims.height + 16,
      {
        roughness,
        stroke: computedColor,
        strokeWidth,
        fill: undefined,
        seed,
      }
    )
    svg.appendChild(ellipse)
  }, [dims, color, roughness, strokeWidth, seed])

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-flex items-center justify-center px-5 py-1.5", className)}
    >
      <svg
        ref={svgRef}
        className="pointer-events-none absolute inset-0"
        width={dims.width || "100%"}
        height={dims.height || "100%"}
        style={{ overflow: "visible" }}
      />
      <span className="relative z-10 text-gray-500 dark:text-gray-400 font-handwriting" style={style}>
        {children}
      </span>
    </div>
  )
}

