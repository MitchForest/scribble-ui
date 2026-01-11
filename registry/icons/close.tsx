/**
 * ScribbleClose - Hand-drawn close (X) icon
 *
 * A sketchy X icon with hover effects for dismiss buttons.
 * Redraws with different seeds on hover for playful animation.
 */

import { useEffect, useRef, useState } from "react"
import rough from "roughjs"

import { cn } from "../lib/utils"

export interface ScribbleCloseProps {
  /** Size in pixels */
  size?: number
  /** Color (default state) */
  color?: "default" | "muted" | "accent" | string
  /** Hover color - switches to this on hover */
  hoverColor?: "default" | "muted" | "accent" | string
  /** Roughness level */
  roughness?: number
  /** Click handler */
  onClick?: () => void
  /** Additional class names */
  className?: string
  /** Accessibility label */
  "aria-label"?: string
}

const colorMap: Record<string, string> = {
  default: "#374151",
  muted: "#9ca3af",
  accent: "#e07a5f",
}

function getColor(color: string): string {
  return colorMap[color] || color
}

export function ScribbleClose({
  size = 16,
  color = "muted",
  hoverColor = "accent",
  roughness = 1.5,
  onClick,
  className,
  "aria-label": ariaLabel = "Close",
}: ScribbleCloseProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [drawCount, setDrawCount] = useState(0)

  // Increment draw count on hover for animation effect
  useEffect(() => {
    if (isHovered) {
      setDrawCount((c) => c + 1)
    }
  }, [isHovered])

  useEffect(() => {
    if (!svgRef.current) return

    const svg = svgRef.current
    while (svg.firstChild) svg.removeChild(svg.firstChild)

    const rc = rough.svg(svg)
    const strokeColor = isHovered ? getColor(hoverColor) : getColor(color)
    const strokeWidth = 2
    const padding = 2

    const baseSeed = drawCount * 100 + (isHovered ? 50 : 0)
    const currentRoughness = isHovered ? roughness * 1.3 : roughness

    // Draw X
    const cx = size / 2
    const cy = size / 2
    const armLength = (size - padding * 2) * 0.4

    // First line of X (top-left to bottom-right)
    const x1 = rc.line(cx - armLength, cy - armLength, cx + armLength, cy + armLength, {
      roughness: currentRoughness * 1.3,
      bowing: 2,
      stroke: strokeColor,
      strokeWidth,
      seed: baseSeed + 1,
    })

    // Second line of X (top-right to bottom-left)
    const x2 = rc.line(cx + armLength, cy - armLength, cx - armLength, cy + armLength, {
      roughness: currentRoughness * 1.3,
      bowing: 2,
      stroke: strokeColor,
      strokeWidth,
      seed: baseSeed + 2,
    })

    svg.appendChild(x1)
    svg.appendChild(x2)
  }, [size, color, hoverColor, roughness, isHovered, drawCount])

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "inline-flex items-center justify-center rounded",
        "transition-transform duration-150",
        "hover:scale-110 active:scale-95",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#e07a5f]",
        className
      )}
      style={{
        transform: isHovered ? "rotate(-5deg)" : "rotate(0deg)",
      }}
      aria-label={ariaLabel}
    >
      <svg
        ref={svgRef}
        width={size}
        height={size}
        style={{
          overflow: "visible",
          transition: "transform 150ms ease-out",
        }}
      />
    </button>
  )
}
