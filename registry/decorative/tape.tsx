/**
 * ScribbleTape - Decorative tape strip with torn edges
 * 
 * Two variants:
 * - "css" (default): Lightweight CSS-based torn edges
 * - "sketchy": Organic Rough.js hand-drawn tape with rough edges
 */

import { useEffect, useRef } from "react"
import rough from "roughjs"
import { cn } from "../lib/utils"

export type TapePosition = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center"

export interface ScribbleTapeProps {
  /** Position on parent element */
  position?: TapePosition
  /** Tape variant */
  variant?: "css" | "sketchy"
  /** Tape color */
  color?: "beige" | "white" | "yellow" | "blue" | "transparent"
  /** Rotation angle in degrees (overrides default) */
  rotation?: number
  /** Size of the tape */
  size?: "sm" | "md" | "lg"
  /** Roughness level (sketchy variant only) */
  roughness?: number
  /** Seed for consistent randomness (sketchy variant only) */
  seed?: number
  /** Additional class names */
  className?: string
}

const colorMap = {
  beige: {
    bg: "rgba(255, 248, 220, 0.75)",
    stroke: "rgba(180, 160, 120, 0.6)",
    border: "rgba(200, 180, 150, 0.3)",
  },
  white: {
    bg: "rgba(255, 255, 255, 0.85)",
    stroke: "rgba(180, 180, 180, 0.5)",
    border: "rgba(200, 200, 200, 0.3)",
  },
  yellow: {
    bg: "rgba(254, 249, 195, 0.85)",
    stroke: "rgba(234, 179, 8, 0.5)",
    border: "rgba(234, 179, 8, 0.3)",
  },
  blue: {
    bg: "rgba(219, 234, 254, 0.85)",
    stroke: "rgba(59, 130, 246, 0.5)",
    border: "rgba(59, 130, 246, 0.3)",
  },
  transparent: {
    bg: "rgba(255, 248, 220, 0.7)",
    stroke: "rgba(180, 160, 120, 0.4)",
    border: "rgba(180, 160, 120, 0.2)",
  },
}

const sizeMap = {
  sm: { width: 50, height: 20 },
  md: { width: 70, height: 28 },
  lg: { width: 90, height: 32 },
}

const positionStyles: Record<TapePosition, React.CSSProperties> = {
  "top-left": { top: -10, left: -20 },
  "top-right": { top: -8, right: -22 },
  "bottom-left": { bottom: -10, left: -18 },
  "bottom-right": { bottom: -8, right: -24 },
  "top-center": { top: -6, left: "50%", transform: "translateX(-50%)" },
  "bottom-center": { bottom: -6, left: "50%", transform: "translateX(-50%)" },
}

const defaultRotations: Record<TapePosition, number> = {
  "top-left": -12,
  "top-right": 8,
  "bottom-left": 15,
  "bottom-right": -10,
  "top-center": 0,
  "bottom-center": 0,
}

export function ScribbleTape({
  position = "top-left",
  variant = "css",
  color = "beige",
  rotation,
  size = "md",
  roughness = 1.5,
  seed = 42,
  className,
}: ScribbleTapeProps) {
  const colors = colorMap[color]
  const dimensions = sizeMap[size]
  const posStyle = positionStyles[position]
  const rot = rotation ?? defaultRotations[position]

  if (variant === "sketchy") {
    return (
      <SketchyTape
        position={position}
        posStyle={posStyle}
        colors={colors}
        dimensions={dimensions}
        rotation={rot}
        roughness={roughness}
        seed={seed}
        className={className}
      />
    )
  }

  // CSS variant - lightweight
  return (
    <div
      className={cn("absolute pointer-events-none z-20", className)}
      style={{
        ...posStyle,
        width: dimensions.width,
        height: dimensions.height,
        backgroundColor: colors.bg,
        borderTop: `1px solid ${colors.border}`,
        borderBottom: `1px solid ${colors.border}`,
        transform: position.includes("center") 
          ? `translateX(-50%) rotate(${rot}deg)` 
          : `rotate(${rot}deg)`,
        // Torn edge effect via clip-path
        clipPath: `polygon(
          2% 0%, 8% 15%, 15% 0%, 22% 10%, 30% 0%, 38% 8%, 45% 0%, 52% 12%, 60% 0%, 68% 5%, 75% 0%, 82% 10%, 90% 0%, 95% 8%, 100% 0%,
          100% 100%,
          95% 92%, 88% 100%, 80% 90%, 72% 100%, 65% 95%, 58% 100%, 50% 88%, 42% 100%, 35% 92%, 28% 100%, 20% 95%, 12% 100%, 5% 90%, 0% 100%,
          0% 0%
        )`,
      }}
    />
  )
}

/**
 * Sketchy tape using Rough.js for organic hand-drawn look
 */
function SketchyTape({
  position,
  posStyle,
  colors,
  dimensions,
  rotation,
  roughness,
  seed,
  className,
}: {
  position: TapePosition
  posStyle: React.CSSProperties
  colors: { bg: string; stroke: string }
  dimensions: { width: number; height: number }
  rotation: number
  roughness: number
  seed: number
  className?: string
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const { width, height } = dimensions

  useEffect(() => {
    if (!svgRef.current) return

    const svg = svgRef.current
    while (svg.firstChild) svg.removeChild(svg.firstChild)

    const rc = rough.svg(svg)

    // Tape shape - slightly irregular polygon
    const tape = rc.polygon(
      [
        [3, 4],
        [width - 5, 2],
        [width - 2, height - 3],
        [5, height - 1],
      ],
      {
        roughness,
        stroke: colors.stroke,
        strokeWidth: 1,
        fill: colors.bg,
        fillStyle: "solid",
        seed,
      }
    )
    svg.appendChild(tape)

    // Torn edge effect on ends
    const tearLeft = rc.line(2, 2, 4, height - 2, {
      roughness: roughness * 1.5,
      stroke: colors.stroke,
      strokeWidth: 1.5,
      seed: seed + 1,
    })
    const tearRight = rc.line(width - 3, 1, width - 1, height - 1, {
      roughness: roughness * 1.5,
      stroke: colors.stroke,
      strokeWidth: 1.5,
      seed: seed + 2,
    })
    svg.appendChild(tearLeft)
    svg.appendChild(tearRight)
  }, [width, height, colors, roughness, seed])

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className={cn("absolute pointer-events-none z-20", className)}
      style={{
        ...posStyle,
        transform: position.includes("center")
          ? `translateX(-50%) rotate(${rotation}deg)`
          : `rotate(${rotation}deg)`,
        overflow: "visible",
      }}
    />
  )
}
