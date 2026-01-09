/**
 * ScribbleAccordion - Hand-drawn accordion with Rough.js styling
 * 
 * Built on Radix Accordion for accessibility.
 * Features:
 * - Sketchy border that highlights when open
 * - Optional dashed separator line
 * - Uses ScribblePlusMinus icon
 */

import { createContext, forwardRef, useCallback, useContext, useEffect, useRef, useState } from "react"
import { Accordion as AccordionPrimitive } from "radix-ui"
import rough from "roughjs"
import { ScribblePlusMinus } from "./icons/plus-minus"
import { cn } from "./lib/utils"

// =============================================================================
// CONTEXT - Track open state for items
// =============================================================================

const AccordionItemContext = createContext<{ isOpen: boolean; index: number }>({ 
  isOpen: false, 
  index: 0 
})

// =============================================================================
// ACCORDION ROOT
// =============================================================================

type ScribbleAccordionProps = React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root> & {
  /** Gap between items */
  gap?: number
  className?: string
}

export const ScribbleAccordion = forwardRef<
  HTMLDivElement,
  ScribbleAccordionProps
>(function ScribbleAccordion({ className, gap = 16, ...props }, ref) {
  return (
    <AccordionPrimitive.Root
      ref={ref}
      className={cn("flex flex-col", className)}
      style={{ gap }}
      {...props}
    />
  )
})

// =============================================================================
// ACCORDION ITEM
// =============================================================================

interface ScribbleAccordionItemProps extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> {
  /** Index for seeding roughness */
  index?: number
  /** Whether this item is currently open (controlled externally or via context) */
  isOpen?: boolean
  /** Show dashed separator when open */
  showSeparator?: boolean
  /** Separator Y position from top */
  separatorY?: number
}

export const ScribbleAccordionItem = forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  ScribbleAccordionItemProps
>(function ScribbleAccordionItem(
  { 
    className, 
    children, 
    value, 
    index = 0, 
    isOpen = false,
    showSeparator = true,
    separatorY = 60,
    ...props 
  }, 
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // Measure container
  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setDimensions({ width: rect.width, height: rect.height })
    }
  }, [])

  useEffect(() => {
    updateDimensions()
    
    const observer = new ResizeObserver(updateDimensions)
    if (containerRef.current) {
      observer.observe(containerRef.current)
    }
    
    return () => observer.disconnect()
  }, [updateDimensions, isOpen])

  // Draw rough border
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return

    const svg = svgRef.current
    while (svg.firstChild) svg.removeChild(svg.firstChild)

    const rc = rough.svg(svg)
    const { width, height } = dimensions
    const padding = 2

    // Get colors from CSS variables
    const styles = getComputedStyle(document.documentElement)
    const accentColor = styles.getPropertyValue("--scribble-stroke-accent").trim() || "#e07a5f"
    const mutedColor = styles.getPropertyValue("--scribble-stroke-muted").trim() || "#888"

    // Main border - sketchy rectangle
    const border = rc.rectangle(padding, padding, width - padding * 2, height - padding * 2, {
      roughness: 1.2,
      stroke: isOpen ? accentColor : mutedColor,
      strokeWidth: isOpen ? 2 : 1.5,
      bowing: 1,
      seed: index + 1,
    })
    svg.appendChild(border)

    // If open, draw a dashed line separator under the question
    if (isOpen && showSeparator) {
      const dashLength = 12
      const gapLength = 8
      let x = padding + 16

      while (x < width - padding - 16) {
        const endX = Math.min(x + dashLength, width - padding - 16)
        const dash = rc.line(x, separatorY, endX, separatorY, {
          roughness: 0.8,
          stroke: "#ccc",
          strokeWidth: 1.5,
          seed: index * 100 + x,
        })
        svg.appendChild(dash)
        x += dashLength + gapLength
      }
    }
  }, [dimensions, isOpen, index, showSeparator, separatorY])

  return (
    <AccordionItemContext.Provider value={{ isOpen, index }}>
      <AccordionPrimitive.Item 
        ref={ref} 
        value={value} 
        className={cn("relative", className)} 
        {...props}
      >
        {/* Rough.js SVG overlay */}
        <svg
          ref={svgRef}
          className="pointer-events-none absolute inset-0 z-10"
          style={{ 
            width: dimensions.width || "100%", 
            height: dimensions.height || "100%",
            overflow: "visible",
          }}
        />
        
        {/* Content container */}
        <div 
          ref={containerRef} 
          className="relative bg-white dark:bg-gray-900"
          style={{
            boxShadow: "3px 4px 8px rgba(0, 0, 0, 0.08), 1px 2px 4px rgba(0, 0, 0, 0.04)",
          }}
        >
          {children}
        </div>
      </AccordionPrimitive.Item>
    </AccordionItemContext.Provider>
  )
})

// =============================================================================
// ACCORDION TRIGGER
// =============================================================================

interface ScribbleAccordionTriggerProps extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> {
  /** Show plus/minus icon */
  showIcon?: boolean
}

export const ScribbleAccordionTrigger = forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  ScribbleAccordionTriggerProps
>(function ScribbleAccordionTrigger(
  { className, children, showIcon = true, ...props }, 
  ref
) {
  const { isOpen, index } = useContext(AccordionItemContext)

  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          "group flex w-full items-center justify-between gap-4 p-5 text-left outline-none",
          "focus-visible:ring-2 focus-visible:ring-[var(--scribble-stroke-accent)] focus-visible:ring-offset-2",
          className
        )}
        {...props}
      >
        <span 
          className="font-handwriting text-gray-800 dark:text-gray-200"
          style={{ fontSize: "1.35rem", lineHeight: 1.4 }}
        >
          {children}
        </span>
        {showIcon && (
          <ScribblePlusMinus 
            isOpen={isOpen} 
            seed={index + 10}
          />
        )}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
})

// =============================================================================
// ACCORDION CONTENT
// =============================================================================

export const ScribbleAccordionContent = forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(function ScribbleAccordionContent({ className, children, ...props }, ref) {
  return (
    <AccordionPrimitive.Content
      ref={ref}
      className={cn(
        "overflow-hidden",
        "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
        className
      )}
      {...props}
    >
      <div className="px-5 pb-5">
        <div 
          className="font-handwriting text-gray-600 dark:text-gray-400"
          style={{ fontSize: "1.15rem", lineHeight: 1.6 }}
        >
          {children}
        </div>
      </div>
    </AccordionPrimitive.Content>
  )
})
