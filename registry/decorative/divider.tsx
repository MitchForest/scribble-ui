/**
 * ScribbleDivider - Hand-drawn horizontal divider line
 */

import { useEffect, useRef, useState } from "react"
import rough from "roughjs"
import { cn } from "../lib/utils"

export interface ScribbleDividerProps {
  /** Divider style */
  variant?: "line" | "wavy" | "dashed" | "dots"
  /** Color preset or custom color */
  color?: "muted" | "accent" | string
  /** Stroke width */
  strokeWidth?: number
  /** Roughness level */
  roughness?: number
  /** Additional class names */
  className?: string
}

const colorMap: Record<string, string> = {
  muted: "var(--scribble-stroke-muted)",
  accent: "var(--scribble-stroke-accent)",
}

function getColor(color: string): string {
  if (color in colorMap) {
    if (typeof window !== "undefined") {
      const varName = colorMap[color].slice(4, -1)
      return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || "#6b7280"
    }
    return "#6b7280"
  }
  return color
}

export function ScribbleDivider({
  variant = "line",
  color = "muted",
  strokeWidth = 1.5,
  roughness = 1.5,
  className,
}: ScribbleDividerProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  // ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return
    
    const measure = () => {
      if (!containerRef.current) return
      setWidth(containerRef.current.getBoundingClientRect().width)
    }
    
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  // Draw divider
  useEffect(() => {
    if (!svgRef.current || width === 0) return

    const svg = svgRef.current
    while (svg.firstChild) svg.removeChild(svg.firstChild)

    const rc = rough.svg(svg)
    const computedColor = getColor(color)
    const y = 10

    if (variant === "line") {
      const line = rc.line(0, y, width, y, {
        roughness,
        stroke: computedColor,
        strokeWidth,
        seed: 42,
      })
      svg.appendChild(line)
    } else if (variant === "wavy") {
      // Create a wavy path
      const points: Array<[number, number]> = []
      const segments = Math.floor(width / 20)
      for (let i = 0; i <= segments; i++) {
        const x = (i / segments) * width
        const yOffset = i % 2 === 0 ? -3 : 3
        points.push([x, y + yOffset])
      }
      const path = rc.curve(points, {
        roughness: roughness * 0.5,
        stroke: computedColor,
        strokeWidth,
        seed: 42,
      })
      svg.appendChild(path)
    } else if (variant === "dashed") {
      const dashLength = 15
      const gapLength = 10
      let x = 0
      while (x < width) {
        const endX = Math.min(x + dashLength, width)
        const dash = rc.line(x, y, endX, y, {
          roughness,
          stroke: computedColor,
          strokeWidth,
          seed: 42 + x,
        })
        svg.appendChild(dash)
        x += dashLength + gapLength
      }
    } else {
      // variant === "dots"
      const spacing = 12
      let x = spacing / 2
      while (x < width) {
        const dot = rc.circle(x, y, 3, {
          roughness: roughness * 0.5,
          stroke: computedColor,
          fill: computedColor,
          fillStyle: "solid",
          strokeWidth: 1,
          seed: 42 + x,
        })
        svg.appendChild(dot)
        x += spacing
      }
    }
  }, [width, variant, color, strokeWidth, roughness])

  return (
    <div 
      ref={containerRef} 
      className={cn("w-full", className)}
    >
      <svg
        ref={svgRef}
        width={width || "100%"}
        height={20}
        style={{ overflow: "visible" }}
      />
    </div>
  )
}

