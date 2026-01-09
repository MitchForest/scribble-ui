/**
 * ScribbleHamburger - Hand-drawn hamburger menu icon
 * 
 * Animated transition between hamburger and X (close) states.
 * Uses accent color and redraws with different seeds for playful animation.
 */

import { useEffect, useRef, useState } from "react"
import rough from "roughjs"
import { cn } from "../lib/utils"

export interface ScribbleHamburgerProps {
  /** Whether the menu is open (shows X) or closed (shows hamburger) */
  isOpen?: boolean
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
  muted: "#6b7280",
  accent: "#e07a5f",
}

function getColor(color: string): string {
  return colorMap[color] || color
}

export function ScribbleHamburger({
  isOpen = false,
  size = 24,
  color = "default",
  hoverColor = "accent",
  roughness = 1.5,
  onClick,
  className,
  "aria-label": ariaLabel = "Toggle menu",
}: ScribbleHamburgerProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [drawCount, setDrawCount] = useState(0)

  // Increment draw count on state change for animation
  useEffect(() => {
    setDrawCount(c => c + 1)
  }, [isOpen])

  useEffect(() => {
    if (!svgRef.current) return

    const svg = svgRef.current
    while (svg.firstChild) svg.removeChild(svg.firstChild)

    const rc = rough.svg(svg)
    // Use hover color when hovered, otherwise default color
    const strokeColor = isHovered ? getColor(hoverColor) : getColor(color)
    const strokeWidth = 2.5
    const padding = 3
    
    // Use draw count for unique seeds (creates redraw animation effect)
    const baseSeed = drawCount * 100 + (isHovered ? 50 : 0)
    const currentRoughness = isHovered ? roughness * 1.3 : roughness

    if (isOpen) {
      // Draw X with playful style
      const cx = size / 2
      const cy = size / 2
      const armLength = (size - padding * 2) * 0.4
      
      // First line of X (top-left to bottom-right)
      const x1 = rc.line(
        cx - armLength, cy - armLength,
        cx + armLength, cy + armLength,
        {
          roughness: currentRoughness * 1.3,
          bowing: 2,
          stroke: strokeColor,
          strokeWidth: strokeWidth + 0.5,
          seed: baseSeed + 1,
        }
      )
      
      // Second line of X (top-right to bottom-left)
      const x2 = rc.line(
        cx + armLength, cy - armLength,
        cx - armLength, cy + armLength,
        {
          roughness: currentRoughness * 1.3,
          bowing: 2,
          stroke: strokeColor,
          strokeWidth: strokeWidth + 0.5,
          seed: baseSeed + 2,
        }
      )
      
      svg.appendChild(x1)
      svg.appendChild(x2)
    } else {
      // Draw hamburger (3 wavy lines)
      const lineWidth = size - padding * 2
      const y1 = size * 0.22
      const y2 = size * 0.5
      const y3 = size * 0.78

      // Top line - slightly shorter on right
      const line1 = rc.line(padding, y1, padding + lineWidth - 2, y1 + 1, {
        roughness: currentRoughness,
        bowing: 1.5,
        stroke: strokeColor,
        strokeWidth,
        seed: baseSeed + 10,
      })
      
      // Middle line - full width
      const line2 = rc.line(padding + 1, y2, padding + lineWidth, y2 - 0.5, {
        roughness: currentRoughness,
        bowing: 1.5,
        stroke: strokeColor,
        strokeWidth,
        seed: baseSeed + 11,
      })
      
      // Bottom line - slightly shorter on left
      const line3 = rc.line(padding + 2, y3 - 1, padding + lineWidth, y3, {
        roughness: currentRoughness,
        bowing: 1.5,
        stroke: strokeColor,
        strokeWidth,
        seed: baseSeed + 12,
      })
      
      svg.appendChild(line1)
      svg.appendChild(line2)
      svg.appendChild(line3)
    }
  }, [isOpen, size, color, hoverColor, roughness, isHovered, drawCount])

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "inline-flex items-center justify-center p-1.5 rounded-lg",
        "transition-transform duration-150",
        "hover:scale-110 active:scale-95",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#e07a5f]",
        className
      )}
      style={{
        transform: isHovered ? "rotate(-3deg)" : "rotate(0deg)",
      }}
      aria-label={ariaLabel}
      aria-expanded={isOpen}
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
