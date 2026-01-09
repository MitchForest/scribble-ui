/**
 * ScribbleTooltip - Hand-drawn tooltip
 *
 * Uses CSS border as base with Rough.js overlay for sketchy effect.
 * Following the shadcn pattern but with hand-drawn aesthetics.
 */

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { useEffect, useRef, useState } from "react"
import rough from "roughjs"
import { cn } from "./lib/utils"

// =============================================================================
// PROVIDER
// =============================================================================

function ScribbleTooltipProvider({
  delayDuration = 200,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

// =============================================================================
// ROOT
// =============================================================================

function ScribbleTooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <ScribbleTooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </ScribbleTooltipProvider>
  )
}

// =============================================================================
// TRIGGER
// =============================================================================

function ScribbleTooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

// =============================================================================
// TOOLTIP INNER CONTENT (with border drawing)
// =============================================================================

interface TooltipInnerProps {
  children: React.ReactNode
}

function TooltipInner({ children }: TooltipInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // Effect 1: Measure content with ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return

    const measure = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      setDimensions({ width: rect.width, height: rect.height })
    }

    // Initial measure with small delay for portal render
    const timer = setTimeout(measure, 50)

    const observer = new ResizeObserver(measure)
    observer.observe(containerRef.current)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [])

  // Effect 2: Draw Rough.js border when dimensions change
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return

    const svg = svgRef.current
    while (svg.firstChild) svg.removeChild(svg.firstChild)

    const rc = rough.svg(svg)
    const strokeColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--scribble-stroke").trim() || "#1a1a1a"

    const padding = 1

    // Draw sketchy border
    const border = rc.rectangle(
      padding,
      padding,
      dimensions.width - padding * 2,
      dimensions.height - padding * 2,
      {
        roughness: 0.8,
        bowing: 0.5,
        stroke: strokeColor,
        strokeWidth: 1.5,
        seed: 42,
      }
    )
    svg.appendChild(border)
  }, [dimensions])

  return (
    <div
      ref={containerRef}
      className="relative bg-[#fffef8] dark:bg-gray-900 px-3 py-1.5"
    >
      {/* Rough.js border SVG */}
      <svg
        ref={svgRef}
        className="absolute inset-0 pointer-events-none z-0"
        width={dimensions.width || "100%"}
        height={dimensions.height || "100%"}
        style={{ overflow: "visible" }}
      />

      {/* Content */}
      <span
        className="relative z-10 text-sm text-gray-800 dark:text-gray-200 whitespace-nowrap block"
        style={{ fontFamily: "var(--font-handwriting-body)" }}
      >
        {children}
      </span>
    </div>
  )
}

// =============================================================================
// CONTENT
// =============================================================================

interface ScribbleTooltipContentProps
  extends React.ComponentProps<typeof TooltipPrimitive.Content> {
  /** Hide the arrow */
  hideArrow?: boolean
}

const ScribbleTooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  ScribbleTooltipContentProps
>(({ className, sideOffset = 6, hideArrow = false, children, ...props }, ref) => {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          "z-50",
          "animate-in fade-in-0 zoom-in-95",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      >
        <TooltipInner>{children}</TooltipInner>
        {!hideArrow && (
          <TooltipPrimitive.Arrow
            className="fill-[#fffef8] dark:fill-gray-900"
            width={10}
            height={5}
          />
        )}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
})
ScribbleTooltipContent.displayName = "ScribbleTooltipContent"

// =============================================================================
// EXPORTS
// =============================================================================

export {
  ScribbleTooltip,
  ScribbleTooltipTrigger,
  ScribbleTooltipContent,
  ScribbleTooltipProvider,
}
