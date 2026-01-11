/**
 * ScribbleCard - Card container with hand-drawn Rough.js border
 * 
 * Features:
 * - Solid background using native SVG (no gaps)
 * - Optional overlay fill patterns (hachure, dots, zigzag-line, cross-hatch)
 * - Sketchy border with customizable roughness
 * - Rotation and shadow props
 * - Optional tape corner decorations
 * - ResizeObserver for proper sizing
 * - Themed via CSS variables
 */

import { forwardRef, useEffect, useRef, useState } from "react"
import type { ReactNode } from "react";
import rough from "roughjs"

import { ScribbleTape } from "./decorative/tape"
import { cn } from "./lib/utils"

export type TapePosition = "top-left" | "top-right" | "bottom-left" | "bottom-right"
export type FillPattern = "solid" | "hachure" | "zigzag-line" | "cross-hatch" | "dots"

export interface ScribbleCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Background fill color (default white) */
  fillColor?: string
  /** Border stroke color */
  strokeColor?: string
  /** Roughness level (0 = smooth, 2+ = very rough) */
  roughness?: number
  /** Stroke width */
  strokeWidth?: number
  /** Seed for consistent randomness */
  seed?: number
  
  // === Overlay Pattern ===
  /** Optional overlay pattern style */
  overlayPattern?: FillPattern
  /** Overlay pattern color (semi-transparent recommended) */
  overlayColor?: string
  /** Hachure angle for pattern */
  overlayHachureAngle?: number
  /** Hachure gap for pattern */
  overlayHachureGap?: number
  
  // === Appearance ===
  /** Rotation in degrees */
  rotation?: number
  /** Shadow style */
  shadow?: "none" | "sm" | "md" | "lg"
  
  // === Tape Corners ===
  /** Show tape decorations */
  showTape?: boolean
  /** Which corners to show tape on */
  tapePositions?: Array<TapePosition>
  /** Tape color */
  tapeColor?: "beige" | "white" | "yellow" | "blue"
  
  /** Children content */
  children: ReactNode
}

const shadowStyles = {
  none: undefined,
  sm: "1px 2px 4px rgba(0, 0, 0, 0.04)",
  md: "2px 3px 8px rgba(0, 0, 0, 0.06)",
  lg: "4px 6px 12px rgba(0, 0, 0, 0.08)",
}

export const ScribbleCard = forwardRef<HTMLDivElement, ScribbleCardProps>(
  function ScribbleCard(
    {
      className,
      style,
      children,
      fillColor = "#ffffff",
      strokeColor,
      roughness = 1.2,
      strokeWidth = 2,
      seed = 42,
      // Overlay pattern
      overlayPattern,
      overlayColor = "rgba(200, 200, 200, 0.1)",
      overlayHachureAngle = 45,
      overlayHachureGap = 10,
      // Appearance
      rotation = 0,
      shadow = "none",
      // Tape
      showTape = false,
      tapePositions = ["top-left", "bottom-right"],
      tapeColor = "beige",
      ...props
    },
    ref
  ) {
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
      const observer = new ResizeObserver(measure)
      observer.observe(containerRef.current)
      return () => observer.disconnect()
    }, [])

    // Draw card layers
    useEffect(() => {
      if (!svgRef.current || dims.width === 0) return

      const svg = svgRef.current
      while (svg.firstChild) svg.removeChild(svg.firstChild)

      const { width, height } = dims
      const padding = 3

      // Get border color from CSS variables if not provided
      const computedStroke = strokeColor 
        ?? (typeof window !== "undefined" 
          ? getComputedStyle(document.documentElement).getPropertyValue("--scribble-stroke-muted").trim() || "#888"
          : "#888")

      // 1. Solid white background using native SVG rect (no gaps!)
      const whiteBg = document.createElementNS("http://www.w3.org/2000/svg", "rect")
      whiteBg.setAttribute("x", "0")
      whiteBg.setAttribute("y", "0")
      whiteBg.setAttribute("width", String(width))
      whiteBg.setAttribute("height", String(height))
      whiteBg.setAttribute("fill", fillColor)
      svg.appendChild(whiteBg)

      const rc = rough.svg(svg)

      // 2. Optional overlay pattern (semi-transparent decorative layer)
      if (overlayPattern && overlayPattern !== "solid") {
        const inset = 6 // Stay inside the wobbly border
        const overlay = rc.rectangle(inset, inset, width - inset * 2, height - inset * 2, {
          roughness: roughness * 1.2,
          stroke: "transparent",
          fill: overlayColor,
          fillStyle: overlayPattern,
          hachureAngle: overlayHachureAngle,
          hachureGap: overlayHachureGap,
          fillWeight: 1.5,
          seed: seed + 50,
        })
        svg.appendChild(overlay)
      }

      // 3. Border on top
      const border = rc.rectangle(padding, padding, width - padding * 2, height - padding * 2, {
        roughness,
        bowing: 1,
        stroke: computedStroke,
        strokeWidth,
        seed: seed + 1,
      })
      svg.appendChild(border)
    }, [
      dims, fillColor, strokeColor, roughness, strokeWidth, seed,
      overlayPattern, overlayColor, overlayHachureAngle, overlayHachureGap
    ])

    return (
      <div
        ref={(node) => {
          // Handle both refs
          if (typeof ref === "function") ref(node)
          else if (ref) ref.current = node
          containerRef.current = node
        }}
        className={cn("relative", className)}
        style={{
          transform: rotation !== 0 ? `rotate(${rotation}deg)` : undefined,
          boxShadow: shadowStyles[shadow],
          ...style,
        }}
        {...props}
      >
        {/* SVG layer for rough drawings */}
        <svg
          ref={svgRef}
          className="pointer-events-none absolute inset-0"
          width={dims.width || "100%"}
          height={dims.height || "100%"}
          style={{ overflow: "visible", zIndex: 0 }}
        />
        
        {/* Tape decorations */}
        {showTape && tapePositions.map((position) => (
          <ScribbleTape 
            key={position} 
            position={position} 
            color={tapeColor}
          />
        ))}
        
        {/* Content */}
        <div className="relative z-10">{children}</div>
      </div>
    )
  }
)

// =============================================================================
// CARD SUBCOMPONENTS
// =============================================================================

export type ScribbleCardHeaderProps = React.HTMLAttributes<HTMLDivElement>

export function ScribbleCardHeader({ className, ...props }: ScribbleCardHeaderProps) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-6 pb-4", className)}
      {...props}
    />
  )
}

export type ScribbleCardTitleProps = React.HTMLAttributes<HTMLHeadingElement>

export function ScribbleCardTitle({ className, ...props }: ScribbleCardTitleProps) {
  return (
    <h3
      className={cn(
        "text-lg font-semibold leading-none tracking-tight text-gray-900 dark:text-gray-100",
        className
      )}
      style={{ fontFamily: "var(--font-handwriting-heading)" }}
      {...props}
    />
  )
}

export type ScribbleCardDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>

export function ScribbleCardDescription({ className, ...props }: ScribbleCardDescriptionProps) {
  return (
    <p
      className={cn("text-sm text-gray-600 dark:text-gray-400", className)}
      style={{ fontFamily: "var(--font-handwriting-body)" }}
      {...props}
    />
  )
}

export type ScribbleCardContentProps = React.HTMLAttributes<HTMLDivElement>

export function ScribbleCardContent({ className, ...props }: ScribbleCardContentProps) {
  return <div className={cn("p-6 pt-0", className)} {...props} />
}

export type ScribbleCardFooterProps = React.HTMLAttributes<HTMLDivElement>

export function ScribbleCardFooter({ className, ...props }: ScribbleCardFooterProps) {
  return (
    <div
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  )
}
