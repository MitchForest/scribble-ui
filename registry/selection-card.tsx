/**
 * ScribbleSelectionCard - Selectable card with hand-drawn Rough.js border
 * 
 * Features:
 * - Sketchy border that changes color when selected
 * - Subtle background tint when selected
 * - Hover wobble effect
 * - Accessible as a button with proper aria attributes
 * - Themed via CSS variables
 */

import { forwardRef, useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import rough from "roughjs"

import { cn } from "./lib/utils"

export interface ScribbleSelectionCardProps {
  /** Whether the card is selected */
  selected?: boolean
  /** Callback when the card is clicked */
  onSelect?: () => void
  /** Disabled state */
  disabled?: boolean
  /** Border roughness level */
  roughness?: number
  /** Selected border/accent color */
  selectedColor?: string
  /** Unselected border color */
  borderColor?: string
  /** Seed for consistent randomness */
  seed?: number
  /** Additional class names for the outer button */
  className?: string
  /** Additional class names for the content wrapper */
  contentClassName?: string
  /** Card content */
  children: ReactNode
}

export const ScribbleSelectionCard = forwardRef<HTMLButtonElement, ScribbleSelectionCardProps>(
  function ScribbleSelectionCard(
    {
      selected = false,
      onSelect,
      disabled = false,
      roughness = 1.2,
      selectedColor = "#e07a5f",
      borderColor = "#9ca3af",
      seed = 42,
      className,
      contentClassName,
      children,
    },
    ref
  ) {
    const svgRef = useRef<SVGSVGElement>(null)
    const containerRef = useRef<HTMLButtonElement>(null)
    const [dims, setDims] = useState({ width: 0, height: 0 })
    const [isHovered, setIsHovered] = useState(false)
    const [drawCount, setDrawCount] = useState(0)

    // ResizeObserver for dimension changes
    useEffect(() => {
      const container = containerRef.current
      if (!container) return

      const measure = () => {
        const rect = container.getBoundingClientRect()
        setDims({ width: rect.width, height: rect.height })
      }

      measure()
      const observer = new ResizeObserver(measure)
      observer.observe(container)
      return () => observer.disconnect()
    }, [])

    // Trigger redraw on hover for wobble effect
    useEffect(() => {
      setDrawCount(c => c + 1)
    }, [isHovered, selected])

    // Draw border with Rough.js
    useEffect(() => {
      if (!svgRef.current || dims.width === 0) return

      const svg = svgRef.current
      while (svg.firstChild) svg.removeChild(svg.firstChild)

      const { width, height } = dims
      const padding = 3

      // Background fill
      const bgColor = selected ? `${selectedColor}08` : "#ffffff"
      const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect")
      bg.setAttribute("x", "0")
      bg.setAttribute("y", "0")
      bg.setAttribute("width", String(width))
      bg.setAttribute("height", String(height))
      bg.setAttribute("fill", bgColor)
      bg.setAttribute("rx", "8")
      svg.appendChild(bg)

      const rc = rough.svg(svg)
      const strokeColor = disabled ? "#ccc" : (selected ? selectedColor : borderColor)
      const baseSeed = seed + drawCount * 10 + (isHovered ? 100 : 0)
      const currentRoughness = isHovered ? roughness * 1.3 : roughness
      const strokeWidth = selected ? 2.5 : 2

      // Border
      const border = rc.rectangle(padding, padding, width - padding * 2, height - padding * 2, {
        roughness: currentRoughness,
        bowing: isHovered ? 1.5 : 1,
        stroke: strokeColor,
        strokeWidth,
        seed: baseSeed,
      })
      svg.appendChild(border)
    }, [dims, selected, isHovered, disabled, roughness, selectedColor, borderColor, seed, drawCount])

    return (
      <button
        ref={(node) => {
          if (typeof ref === "function") ref(node)
          else if (ref) ref.current = node
          containerRef.current = node
        }}
        type="button"
        onClick={() => {
          if (!disabled) onSelect?.()
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={disabled}
        aria-pressed={selected}
        className={cn(
          "relative text-left transition-transform",
          "hover:scale-[1.02] active:scale-[0.98]",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#e07a5f]",
          disabled && "opacity-50 cursor-not-allowed hover:scale-100 active:scale-100",
          className
        )}
      >
        {/* SVG layer for rough drawings */}
        <svg
          ref={svgRef}
          className="pointer-events-none absolute inset-0"
          width={dims.width || "100%"}
          height={dims.height || "100%"}
          style={{ overflow: "visible", zIndex: 0 }}
        />
        
        {/* Content */}
        <div className={cn("relative z-10", contentClassName)}>{children}</div>
      </button>
    )
  }
)
