/**
 * ScribbleLink - Text link with hand-drawn hover underline
 * 
 * Features:
 * - Hand-drawn underline on hover using Rough.js
 * - Supports asChild pattern for router links
 * - Color variants (default, muted, accent)
 * - Optional always-show underline
 * - Unique seed per link for varied underlines
 * - Separate underline color option
 */

import {  forwardRef, useEffect, useId, useRef, useState } from "react"
import { Slot } from "radix-ui"
import rough from "roughjs"
import type {ReactNode} from "react";
import { cn } from "./lib/utils"

export interface ScribbleLinkProps {
  /** Link URL (ignored if asChild is true) */
  href?: string
  /** Render as child element (for router Links) */
  asChild?: boolean
  /** Text color variant */
  color?: "default" | "muted" | "accent"
  /** Underline color (defaults to same as color) */
  underlineColor?: "default" | "muted" | "accent"
  /** Underline behavior */
  underline?: "hover" | "always" | "none"
  /** Seed for unique underline shape */
  seed?: number
  /** Additional class names */
  className?: string
  /** Link content */
  children: ReactNode
  /** Click handler */
  onClick?: () => void
}

const colorMap = {
  default: "#1a1a1a",
  muted: "#6b7280",
  accent: "#e07a5f",
}

const textColorMap = {
  default: "text-gray-800 dark:text-gray-200",
  muted: "text-gray-500 dark:text-gray-400",
  accent: "text-[#e07a5f]",
}

// Generate a stable numeric hash from a string
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

export const ScribbleLink = forwardRef<HTMLAnchorElement, ScribbleLinkProps>(
  function ScribbleLink(
    { 
      href, 
      asChild, 
      color = "default", 
      underlineColor,
      underline = "hover",
      seed: seedProp,
      className, 
      children,
      onClick,
      ...props 
    }, 
    ref
  ) {
    const id = useId()
    const [isHovered, setIsHovered] = useState(false)
    const [isMounted, setIsMounted] = useState(false)
    const svgRef = useRef<SVGSVGElement>(null)
    const textRef = useRef<HTMLSpanElement>(null)
    const [dims, setDims] = useState({ width: 0, height: 0 })
    
    // Generate unique seed from id if not provided
    const seed = seedProp ?? hashString(id)
    
    // Use underlineColor if specified, otherwise fall back to color
    const lineColorKey = underlineColor ?? color
    
    const showUnderline = underline === "always" || (underline === "hover" && isHovered)
    
    const Comp = asChild ? Slot.Root : "a"

    // Track mount state
    useEffect(() => {
      setIsMounted(true)
    }, [])

    // Measure text
    useEffect(() => {
      if (!textRef.current || !isMounted) return
      
      const measure = () => {
        if (!textRef.current) return
        const rect = textRef.current.getBoundingClientRect()
        setDims({ width: rect.width, height: rect.height })
      }
      
      measure()
      const observer = new ResizeObserver(measure)
      observer.observe(textRef.current)
      return () => observer.disconnect()
    }, [isMounted])

    // Draw underline with unique seed
    useEffect(() => {
      if (!svgRef.current || dims.width === 0 || !showUnderline) return

      const svg = svgRef.current
      while (svg.firstChild) svg.removeChild(svg.firstChild)

      const rc = rough.svg(svg)
      const lineColor = colorMap[lineColorKey]
      const y = dims.height + 2

      const line = rc.line(0, y, dims.width, y, {
        roughness: isHovered ? 2.0 : 1.4,
        bowing: isHovered ? 2 : 1.2,
        stroke: lineColor,
        strokeWidth: 2,
        seed: seed + (isHovered ? 1000 : 0), // Shift seed on hover for animation
      })
      svg.appendChild(line)
    }, [dims, showUnderline, lineColorKey, isHovered, seed])
    
    return (
      <Comp
        ref={ref}
        href={asChild ? undefined : href}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "font-handwriting cursor-pointer transition-colors inline-block",
          textColorMap[color],
          "hover:opacity-90",
          className
        )}
        {...props}
      >
        <span ref={textRef} className="relative inline-block">
          {children}
          {showUnderline && isMounted && (
            <svg
              ref={svgRef}
              className="pointer-events-none absolute left-0 top-0"
              width={dims.width || "100%"}
              height={dims.height + 8}
              style={{ overflow: "visible" }}
            />
          )}
        </span>
      </Comp>
    )
  }
)
