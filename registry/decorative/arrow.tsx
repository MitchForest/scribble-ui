/**
 * ScribbleArrow - Hand-drawn arrow
 */

import { useEffect, useRef } from "react"
import rough from "roughjs"
import { cn } from "./lib/utils"

export interface ScribbleArrowProps {
  /** Arrow direction */
  direction?: "right" | "left" | "up" | "down"
  /** Arrow length */
  length?: number
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

export function ScribbleArrow({
  direction = "right",
  length = 60,
  color = "muted",
  strokeWidth = 2,
  roughness = 1.5,
  className,
}: ScribbleArrowProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  // Calculate dimensions based on direction
  const isHorizontal = direction === "left" || direction === "right"
  const width = isHorizontal ? length : 24
  const height = isHorizontal ? 24 : length
  const arrowHeadSize = 10

  useEffect(() => {
    if (!svgRef.current) return

    const svg = svgRef.current
    while (svg.firstChild) svg.removeChild(svg.firstChild)

    const rc = rough.svg(svg)
    const computedColor = getColor(color)

    let startX: number, startY: number, endX: number, endY: number
    let arrowHead1: [number, number, number, number]
    let arrowHead2: [number, number, number, number]

    const padding = 4

    switch (direction) {
      case "right":
        startX = padding
        startY = height / 2
        endX = width - padding
        endY = height / 2
        arrowHead1 = [endX, endY, endX - arrowHeadSize, endY - arrowHeadSize / 2]
        arrowHead2 = [endX, endY, endX - arrowHeadSize, endY + arrowHeadSize / 2]
        break
      case "left":
        startX = width - padding
        startY = height / 2
        endX = padding
        endY = height / 2
        arrowHead1 = [endX, endY, endX + arrowHeadSize, endY - arrowHeadSize / 2]
        arrowHead2 = [endX, endY, endX + arrowHeadSize, endY + arrowHeadSize / 2]
        break
      case "down":
        startX = width / 2
        startY = padding
        endX = width / 2
        endY = height - padding
        arrowHead1 = [endX, endY, endX - arrowHeadSize / 2, endY - arrowHeadSize]
        arrowHead2 = [endX, endY, endX + arrowHeadSize / 2, endY - arrowHeadSize]
        break
      case "up":
        startX = width / 2
        startY = height - padding
        endX = width / 2
        endY = padding
        arrowHead1 = [endX, endY, endX - arrowHeadSize / 2, endY + arrowHeadSize]
        arrowHead2 = [endX, endY, endX + arrowHeadSize / 2, endY + arrowHeadSize]
        break
    }

    // Draw main line
    const line = rc.line(startX, startY, endX, endY, {
      roughness,
      stroke: computedColor,
      strokeWidth,
      seed: 42,
    })
    svg.appendChild(line)

    // Draw arrow head
    const head1 = rc.line(...arrowHead1, {
      roughness: roughness * 0.7,
      stroke: computedColor,
      strokeWidth,
      seed: 43,
    })
    const head2 = rc.line(...arrowHead2, {
      roughness: roughness * 0.7,
      stroke: computedColor,
      strokeWidth,
      seed: 44,
    })
    svg.appendChild(head1)
    svg.appendChild(head2)
  }, [direction, length, color, strokeWidth, roughness, width, height])

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

