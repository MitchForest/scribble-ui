/**
 * ScribbleButton - Hand-drawn button with Rough.js border
 * 
 * Features:
 * - Sketchy border that "wobbles" on hover
 * - ResizeObserver for proper sizing with dynamic content/fonts
 * - Works as button or link (via asChild)
 * - Themed via CSS variables
 */

import { Slot } from "radix-ui"
import { forwardRef, useEffect, useRef, useState } from "react"
import rough from "roughjs"

import { ScribbleUnderline } from "./annotation/underline"
import { cn } from "./lib/utils"

export interface ScribbleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Render as child element (for links) */
  asChild?: boolean
  /** Button visual style */
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive"
  /** Button size */
  size?: "sm" | "md" | "lg" | "icon"
  /** Fill color override (defaults to CSS variable) */
  fillColor?: string
  /** Stroke color override (defaults to CSS variable) */
  strokeColor?: string
  /** Roughness level */
  roughness?: number
}

const variantConfig = {
  primary: {
    fill: "var(--scribble-stroke-accent)",
    stroke: "var(--scribble-stroke)",
    textClass: "text-white",
    fillStyle: "solid" as const,
  },
  secondary: {
    fill: "var(--scribble-fill-muted)",
    stroke: "var(--scribble-stroke-muted)",
    textClass: "text-gray-800 dark:text-gray-200",
    fillStyle: "solid" as const,
  },
  outline: {
    fill: "transparent",
    stroke: "var(--scribble-stroke)",
    textClass: "text-gray-800 dark:text-gray-200",
    fillStyle: undefined,
  },
  ghost: {
    fill: "transparent",
    stroke: "transparent",
    textClass: "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100",
    fillStyle: undefined,
  },
  destructive: {
    fill: "var(--scribble-stroke-error)",
    stroke: "var(--scribble-stroke-error)",
    textClass: "text-white",
    fillStyle: "solid" as const,
  },
}

const sizeConfig = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-7 py-3.5 text-lg",
  icon: "p-2 text-base",
}

export const ScribbleButton = forwardRef<HTMLButtonElement, ScribbleButtonProps>(
  function ScribbleButton(
    {
      className,
      children,
      asChild = false,
      variant = "primary",
      size = "md",
      fillColor,
      strokeColor,
      roughness = 1.2,
      disabled,
      ...props
    },
    ref
  ) {
    const svgRef = useRef<SVGSVGElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [dims, setDims] = useState({ width: 0, height: 0 })
    const [isHovered, setIsHovered] = useState(false)

    const config = variantConfig[variant]
    const fill = fillColor ?? config.fill
    const stroke = strokeColor ?? config.stroke

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

    // Draw rough border
    useEffect(() => {
      if (!svgRef.current || dims.width === 0) return

      const svg = svgRef.current
      while (svg.firstChild) svg.removeChild(svg.firstChild)

      // Ghost variant has no border
      if (variant === "ghost") return

      const rc = rough.svg(svg)
      
      // Get computed color values for CSS variables
      const computedFill = fill.startsWith("var(") 
        ? getComputedStyle(document.documentElement).getPropertyValue(fill.slice(4, -1)).trim() 
        : fill
      const computedStroke = stroke.startsWith("var(")
        ? getComputedStyle(document.documentElement).getPropertyValue(stroke.slice(4, -1)).trim()
        : stroke

      const rect = rc.rectangle(2, 2, dims.width - 4, dims.height - 4, {
        roughness: isHovered ? roughness * 1.5 : roughness,
        bowing: isHovered ? 2 : 1,
        stroke: computedStroke,
        strokeWidth: 2,
        fill: computedFill,
        fillStyle: config.fillStyle,
        seed: isHovered ? 99 : 42,
      })
      svg.appendChild(rect)
    }, [dims, isHovered, variant, fill, stroke, roughness, config.fillStyle])

    const Comp = asChild ? Slot.Root : "button"

    // Ghost variant gets underline hover effect
    const content = variant === "ghost" ? (
      <ScribbleUnderline
        show={isHovered}
        color="accent"
        strokeWidth={2}
        duration={200}
      >
        {children}
      </ScribbleUnderline>
    ) : (
      children
    )

    return (
      <div
        ref={containerRef}
        className="relative inline-flex group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <svg
          ref={svgRef}
          className="pointer-events-none absolute inset-0"
          width={dims.width || "100%"}
          height={dims.height || "100%"}
          style={{ overflow: "visible" }}
        />
        <Comp
          ref={ref}
          disabled={disabled}
          className={cn(
            "relative z-10 inline-flex items-center justify-center font-handwriting transition-transform",
            variant !== "ghost" && "hover:scale-[1.02] active:scale-[0.98]",
            "disabled:pointer-events-none disabled:opacity-50",
            "outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--scribble-stroke-accent)]",
            config.textClass,
            sizeConfig[size],
            className
          )}
          style={{ fontWeight: 600 }}
          {...props}
        >
          {content}
        </Comp>
      </div>
    )
  }
)
