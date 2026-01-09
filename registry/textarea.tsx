/**
 * ScribbleTextarea - Multi-line input with hand-drawn Rough.js border
 * 
 * Features:
 * - Sketchy border that responds to focus/hover
 * - ResizeObserver for proper sizing
 * - Themed via CSS variables
 */

import { forwardRef, useEffect, useRef, useState } from "react"
import rough from "roughjs"
import { cn } from "./lib/utils"

export interface ScribbleTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Error state */
  error?: boolean
  /** Roughness level */
  roughness?: number
}

export const ScribbleTextarea = forwardRef<HTMLTextAreaElement, ScribbleTextareaProps>(
  function ScribbleTextarea({ className, error, roughness = 1.2, ...props }, ref) {
    const svgRef = useRef<SVGSVGElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [dims, setDims] = useState({ width: 0, height: 0 })
    const [isFocused, setIsFocused] = useState(false)

    // ResizeObserver for dimension changes
    useEffect(() => {
      if (!containerRef.current) return

      const measure = () => {
        if (!containerRef.current) return
        // Use offsetWidth/offsetHeight - these give layout dimensions without transform effects
        setDims({ width: containerRef.current.offsetWidth, height: containerRef.current.offsetHeight })
      }

      measure()
      const observer = new ResizeObserver(measure)
      observer.observe(containerRef.current)
      return () => observer.disconnect()
    }, [])

    // Draw rough border
    useEffect(() => {
      if (!svgRef.current || dims.width === 0) return

      const svg = svgRef.current
      while (svg.firstChild) svg.removeChild(svg.firstChild)

      const rc = rough.svg(svg)
      
      // Get colors from CSS variables
      const styles = getComputedStyle(document.documentElement)
      const errorColor = styles.getPropertyValue("--scribble-stroke-error").trim() || "#dc2626"
      const accentColor = styles.getPropertyValue("--scribble-stroke-accent").trim() || "#e07a5f"
      const mutedColor = styles.getPropertyValue("--scribble-stroke-muted").trim() || "#6b7280"
      const bgColor = styles.getPropertyValue("--scribble-bg-card").trim() || "#ffffff"
      
      const strokeColor = error ? errorColor : isFocused ? accentColor : mutedColor
      const strokeWidth = isFocused || error ? 2.5 : 2

      const rect = rc.rectangle(2, 2, dims.width - 4, dims.height - 4, {
        roughness,
        bowing: 1,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        fill: bgColor,
        fillStyle: "solid",
        seed: 42,
      })
      svg.appendChild(rect)
    }, [dims, isFocused, error, roughness])

    return (
      <div ref={containerRef} className="relative w-full">
        <svg
          ref={svgRef}
          className="pointer-events-none absolute inset-0"
          width={dims.width || "100%"}
          height={dims.height || "100%"}
          style={{ overflow: "visible" }}
        />
        <textarea
          ref={ref}
          className={cn(
            "relative z-10 w-full bg-transparent px-4 py-3 font-handwriting resize-none",
            "text-gray-800 dark:text-gray-200",
            "placeholder:text-gray-400 dark:placeholder:text-gray-500",
            "outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          style={{ fontSize: "1.1rem", minHeight: "120px" }}
          onFocus={(e) => {
            setIsFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            props.onBlur?.(e)
          }}
          {...props}
        />
      </div>
    )
  }
)
