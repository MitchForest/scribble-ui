/**
 * ScribbleHeart - Hand-drawn heart shape
 */

import { useEffect, useRef } from "react"
import rough from "roughjs"
import { cn } from "../lib/utils"

export interface ScribbleHeartProps {
  /** Size in pixels */
  size?: number
  /** Stroke color */
  strokeColor?: "accent" | "error" | string
  /** Fill color */
  fillColor?: "accent" | "error" | string
  /** Roughness level */
  roughness?: number
  /** Seed for consistent randomness */
  seed?: number
  /** Additional class names */
  className?: string
}

const colorMap: Partial<Record<string, { stroke: string; fill: string }>> = {
  accent: { stroke: "#c75a4a", fill: "#e07a5f" },
  error: { stroke: "#b91c1c", fill: "#dc2626" },
}

export function ScribbleHeart({
  size = 40,
  strokeColor = "accent",
  fillColor = "accent",
  roughness = 1,
  seed = 42,
  className,
}: ScribbleHeartProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    const svg = svgRef.current
    while (svg.firstChild) svg.removeChild(svg.firstChild)

    const rc = rough.svg(svg)

    // Resolve colors
    const stroke = colorMap[strokeColor]?.stroke || strokeColor
    const fill = colorMap[fillColor]?.fill || fillColor

    // Heart path scaled to size
    const scale = size / 40
    const heartPath = `
      M ${20 * scale} ${35 * scale} 
      C ${20 * scale} ${35 * scale} ${5 * scale} ${22 * scale} ${5 * scale} ${12 * scale} 
      C ${5 * scale} ${6 * scale} ${10 * scale} ${2 * scale} ${16 * scale} ${2 * scale} 
      C ${18 * scale} ${2 * scale} ${20 * scale} ${4 * scale} ${20 * scale} ${6 * scale} 
      C ${20 * scale} ${4 * scale} ${22 * scale} ${2 * scale} ${24 * scale} ${2 * scale} 
      C ${30 * scale} ${2 * scale} ${35 * scale} ${6 * scale} ${35 * scale} ${12 * scale} 
      C ${35 * scale} ${22 * scale} ${20 * scale} ${35 * scale} ${20 * scale} ${35 * scale} 
      Z
    `

    const heart = rc.path(heartPath, {
      roughness,
      stroke,
      strokeWidth: 2,
      fill,
      fillStyle: "solid",
      seed,
    })
    svg.appendChild(heart)
  }, [size, strokeColor, fillColor, roughness, seed])

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn("inline-block", className)}
      style={{ overflow: "visible" }}
    />
  )
}

