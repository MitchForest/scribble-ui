/**
 * ScribbleUnderline - Animated hand-drawn underline
 * 
 * Two modes:
 * - "single" (default): Uses react-rough-notation for simple animated underline
 * - "double": Uses Rough.js directly for thick double-line effect with hover wobble
 */

import {  useEffect, useRef, useState } from "react"
import type {ReactNode} from "react";
import { RoughNotation } from "react-rough-notation"
import rough from "roughjs"

import { cn } from "../lib/utils"

export interface ScribbleUnderlineProps {
  children: ReactNode
  /** Whether to show the annotation */
  show?: boolean
  /** Underline style */
  variant?: "single" | "double"
  /** Color preset or custom color */
  color?: "accent" | "success" | "warning" | "error" | string
  /** Stroke width */
  strokeWidth?: number
  /** Padding below text */
  padding?: number
  /** 
   * Vertical offset for underline position (double variant only).
   * Positive values move underline down, negative moves up.
   * Use when line-height makes automatic positioning incorrect.
   */
  offsetY?: number
  /** Animation duration in ms */
  duration?: number
  /** Animation delay in ms */
  delay?: number
  /** Whether to animate */
  animate?: boolean
  /** Enable hover wobble effect (double variant only) */
  hoverWobble?: boolean
  /** Key to force re-render (e.g., for font changes) */
  animationKey?: string
  /** Additional class names */
  className?: string
}

const colorMap: Record<string, string> = {
  accent: "var(--scribble-stroke-accent)",
  success: "var(--scribble-stroke-success)",
  warning: "var(--scribble-stroke-warning)",
  error: "var(--scribble-stroke-error)",
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

export function ScribbleUnderline({
  children,
  show = true,
  variant = "single",
  color = "accent",
  strokeWidth = 3,
  padding = 4,
  offsetY,
  duration = 800,
  delay = 0,
  animate = true,
  hoverWobble = true,
  animationKey,
  className,
}: ScribbleUnderlineProps) {
  // Use simple RoughNotation for single variant
  if (variant === "single") {
    return (
      <RoughNotation
        key={animationKey}
        type="underline"
        show={show}
        color={getColor(color)}
        strokeWidth={strokeWidth}
        animationDuration={animate ? duration : 0}
        animationDelay={delay}
      >
        {children}
      </RoughNotation>
    )
  }

  // Use custom Rough.js implementation for double variant
  return (
    <DoubleUnderline
      show={show}
      color={color}
      strokeWidth={strokeWidth}
      padding={padding}
      offsetY={offsetY}
      hoverWobble={hoverWobble}
      className={className}
    >
      {children}
    </DoubleUnderline>
  )
}

/**
 * Double underline using Rough.js directly
 */
function DoubleUnderline({
  children,
  show,
  color,
  strokeWidth,
  padding,
  offsetY,
  hoverWobble,
  className,
}: {
  children: ReactNode
  show: boolean
  color: string
  strokeWidth: number
  padding: number
  offsetY?: number
  hoverWobble: boolean
  className?: string
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const [dims, setDims] = useState({ width: 0, height: 0 })
  const [isHovered, setIsHovered] = useState(false)

  // Measure text
  useEffect(() => {
    if (!textRef.current) return
    
    const measure = () => {
      if (!textRef.current) return
      const rect = textRef.current.getBoundingClientRect()
      setDims({ width: rect.width, height: rect.height })
    }
    
    measure()
    const observer = new ResizeObserver(() => measure())
    observer.observe(textRef.current)
    return () => observer.disconnect()
  }, [])

  // Draw double underline
  useEffect(() => {
    if (!svgRef.current || dims.width === 0 || !show) return

    const svg = svgRef.current
    while (svg.firstChild) svg.removeChild(svg.firstChild)

    const rc = rough.svg(svg)
    const computedColor = getColor(color)
    // Use offsetY if provided, otherwise fall back to height + padding
    const y = offsetY !== undefined ? offsetY : dims.height + padding
    const wobble = hoverWobble && isHovered

    // First line (thicker)
    const line1 = rc.line(0, y, dims.width, y, {
      roughness: wobble ? 2.2 : 1.8,
      bowing: wobble ? 3 : 2,
      stroke: computedColor,
      strokeWidth: strokeWidth,
      seed: wobble ? 77 : 42,
    })
    svg.appendChild(line1)

    // Second line (slightly thinner, offset)
    const line2 = rc.line(0, y + strokeWidth - 1, dims.width, y + strokeWidth - 1, {
      roughness: wobble ? 1.8 : 1.5,
      bowing: wobble ? 2 : 1.5,
      stroke: computedColor,
      strokeWidth: strokeWidth * 0.7,
      seed: wobble ? 88 : 55,
    })
    svg.appendChild(line2)
  }, [dims, show, color, strokeWidth, padding, offsetY, isHovered, hoverWobble])

  return (
    <span 
      ref={textRef}
      className={cn("relative inline-block", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      {show && (
        <svg
          ref={svgRef}
          className="pointer-events-none absolute left-0 top-0"
          width={dims.width || "100%"}
          height={dims.height + padding + strokeWidth * 2}
          style={{ overflow: "visible" }}
        />
      )}
    </span>
  )
}
