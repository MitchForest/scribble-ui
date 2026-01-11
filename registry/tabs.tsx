/**
 * ScribbleTabs - Tabs component with hand-drawn Rough.js styling
 * 
 * Uses Radix UI Tabs primitive for accessibility.
 * Features:
 * - Hand-drawn underline on active tab
 * - Sketchy box around tab list
 * - Themed via CSS variables
 */

import { Tabs as TabsPrimitive } from "radix-ui"
import { forwardRef, useEffect, useRef, useState } from "react"
import rough from "roughjs"

import { cn } from "./lib/utils"

// =============================================================================
// TABS ROOT
// =============================================================================

export const ScribbleTabs = forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(function ScribbleTabs({ className, ...props }, ref) {
  return (
    <TabsPrimitive.Root
      ref={ref}
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  )
})

// =============================================================================
// TABS LIST
// =============================================================================

export const ScribbleTabsList = forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(function ScribbleTabsList({ className, ...props }, ref) {
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

  // Draw rough border
  useEffect(() => {
    if (!svgRef.current || dims.width === 0) return

    const svg = svgRef.current
    while (svg.firstChild) svg.removeChild(svg.firstChild)

    const styles = getComputedStyle(document.documentElement)
    const strokeColor = styles.getPropertyValue("--scribble-stroke-muted").trim() || "#ccc"
    const fillColor = styles.getPropertyValue("--scribble-fill-muted").trim() || "#f9f9f9"

    const rc = rough.svg(svg)
    const rect = rc.rectangle(2, 2, dims.width - 4, dims.height - 4, {
      roughness: 1,
      bowing: 0.8,
      stroke: strokeColor,
      strokeWidth: 1.5,
      fill: fillColor,
      fillStyle: "solid",
      seed: 42,
    })
    svg.appendChild(rect)
  }, [dims])

  return (
    <div ref={containerRef} className="relative inline-flex">
      <svg
        ref={svgRef}
        className="pointer-events-none absolute inset-0"
        width={dims.width || "100%"}
        height={dims.height || "100%"}
        style={{ overflow: "visible" }}
      />
      <TabsPrimitive.List
        ref={ref}
        className={cn(
          "relative z-10 inline-flex items-center gap-1 p-1",
          className
        )}
        {...props}
      />
    </div>
  )
})

// =============================================================================
// TABS TRIGGER
// =============================================================================

export const ScribbleTabsTrigger = forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(function ScribbleTabsTrigger({ className, children, ...props }, _ref) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLButtonElement>(null)
  const [dims, setDims] = useState({ width: 0, height: 0 })
  const [isActive, setIsActive] = useState(false)

  // Check if active via data attribute
  useEffect(() => {
    if (!containerRef.current) return
    
    const checkActive = () => {
      const isDataActive = containerRef.current?.getAttribute("data-state") === "active"
      setIsActive(isDataActive)
    }
    
    // Initial check
    checkActive()
    
    // Use MutationObserver to watch for attribute changes
    const observer = new MutationObserver(checkActive)
    observer.observe(containerRef.current, { attributes: true, attributeFilter: ["data-state"] })
    
    return () => observer.disconnect()
  }, [])

  // Measure for underline
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

  // Draw underline when active
  useEffect(() => {
    if (!svgRef.current || dims.width === 0) return

    const svg = svgRef.current
    while (svg.firstChild) svg.removeChild(svg.firstChild)

    if (isActive) {
      const styles = getComputedStyle(document.documentElement)
      const accentColor = styles.getPropertyValue("--scribble-stroke-accent").trim() || "#e07a5f"

      const rc = rough.svg(svg)
      const underline = rc.line(4, dims.height - 4, dims.width - 4, dims.height - 4, {
        roughness: 1.5,
        stroke: accentColor,
        strokeWidth: 2.5,
        seed: 42,
      })
      svg.appendChild(underline)
    }
  }, [dims, isActive])

  return (
    <TabsPrimitive.Trigger
      ref={containerRef}
      className={cn(
        "relative px-4 py-2 font-handwriting transition-colors",
        "text-gray-600 dark:text-gray-400",
        "hover:text-gray-900 dark:hover:text-gray-100",
        "data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100",
        "outline-none focus-visible:ring-2 focus-visible:ring-[var(--scribble-stroke-accent)] focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      style={{ fontSize: "1.1rem" }}
      {...props}
    >
      {children}
      <svg
        ref={svgRef}
        className="pointer-events-none absolute inset-0"
        width={dims.width || "100%"}
        height={dims.height || "100%"}
        style={{ overflow: "visible" }}
      />
    </TabsPrimitive.Trigger>
  )
})

// =============================================================================
// TABS CONTENT
// =============================================================================

export const ScribbleTabsContent = forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(function ScribbleTabsContent({ className, ...props }, ref) {
  return (
    <TabsPrimitive.Content
      ref={ref}
      className={cn(
        "outline-none focus-visible:ring-2 focus-visible:ring-[var(--scribble-stroke-accent)] focus-visible:ring-offset-2",
        className
      )}
      {...props}
    />
  )
})
