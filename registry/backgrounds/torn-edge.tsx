/**
 * ScribbleTornEdge - Hand-drawn torn paper edge effect
 * 
 * Use at the top of a section to create torn paper transition.
 */

import { useEffect, useRef, useState } from "react"
import rough from "roughjs"

import { cn } from "../lib/utils"

export interface ScribbleTornEdgeProps {
  /** Height of the torn edge area */
  height?: number
  /** Fill color below the torn line */
  fillColor?: string
  /** Stroke color for the torn edge */
  strokeColor?: string
  /** Roughness level */
  roughness?: number
  /** Show paper fiber texture lines */
  showFibers?: boolean
  /** Seed for consistent randomness */
  seed?: number
  /** Position style */
  position?: "top" | "bottom"
  /** Additional class names */
  className?: string
}

export function ScribbleTornEdge({
  height = 30,
  fillColor = "#faf8f3",
  strokeColor = "#d0ccc4",
  roughness = 2,
  showFibers = true,
  seed = 42,
  position = "top",
  className,
}: ScribbleTornEdgeProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const updateWidth = () => {
      setWidth(window.innerWidth)
    }
    
    updateWidth()
    window.addEventListener("resize", updateWidth)
    return () => window.removeEventListener("resize", updateWidth)
  }, [])

  useEffect(() => {
    if (!svgRef.current || width === 0) return

    const svg = svgRef.current
    while (svg.firstChild) svg.removeChild(svg.firstChild)

    const rc = rough.svg(svg)
    
    // Create jagged torn edge path
    const points: Array<[number, number]> = []
    const segments = Math.ceil(width / 15)
    
    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * width
      // Random y offset for torn effect
      const y = 8 + Math.sin(i * 1.3) * 4 + Math.cos(i * 2.1) * 3
      points.push([x, position === "top" ? y : height - y])
    }
    
    // Close the shape (fill below/above the torn line)
    if (position === "top") {
      points.push([width, height + 10])
      points.push([0, height + 10])
    } else {
      points.push([width, -10])
      points.push([0, -10])
    }
    
    const tornEdge = rc.polygon(points, {
      roughness,
      stroke: strokeColor,
      strokeWidth: 1.5,
      fill: fillColor,
      fillStyle: "solid",
      seed,
    })
    svg.appendChild(tornEdge)

    // Add some rough "fiber" lines for texture
    if (showFibers) {
      for (let i = 0; i < 8; i++) {
        const x = ((seed + i * 37) % 100) / 100 * width
        const baseY = position === "top" ? 6 : height - 6
        const fiber = rc.line(
          x, baseY + Math.sin(i) * 4,
          x + 3 + Math.cos(i) * 5, baseY + 4 + Math.sin(i * 2) * 3,
          {
            roughness: 1,
            stroke: strokeColor,
            strokeWidth: 0.5,
            seed: seed + i + 100,
          }
        )
        svg.appendChild(fiber)
      }
    }
  }, [width, height, fillColor, strokeColor, roughness, showFibers, seed, position])

  return (
    <svg
      ref={svgRef}
      className={cn(
        "absolute left-0 right-0 w-full pointer-events-none",
        className
      )}
      style={{ 
        [position === "top" ? "top" : "bottom"]: position === "top" ? -18 : -18,
        height,
        overflow: "visible",
      }}
    />
  )
}

