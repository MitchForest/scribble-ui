/**
 * ScribbleSelect - Hand-drawn dropdown select
 *
 * Features:
 * - Sketchy border on trigger and content
 * - Hand-drawn chevron
 * - Items with hover underline
 * - Group labels with dividers
 *
 * Wraps: @radix-ui/react-select
 */

import * as SelectPrimitive from "@radix-ui/react-select"
import * as React from "react"
import { useEffect, useRef, useState } from "react"
import rough from "roughjs"

import { ScribbleUnderline } from "./annotation/underline"
import { ScribbleIcon } from "./icons/icon"
import { cn } from "./lib/utils"

// =============================================================================
// SELECT ROOT
// =============================================================================

const ScribbleSelect = SelectPrimitive.Root

// =============================================================================
// SELECT GROUP
// =============================================================================

const ScribbleSelectGroup = SelectPrimitive.Group

// =============================================================================
// SELECT VALUE
// =============================================================================

const ScribbleSelectValue = SelectPrimitive.Value

// =============================================================================
// SELECT TRIGGER
// =============================================================================

const ScribbleSelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [dims, setDims] = useState({ width: 0, height: 0 })
  const [isFocused, setIsFocused] = useState(false)

  // Combine refs
  React.useImperativeHandle(ref, () => triggerRef.current!)

  // ResizeObserver to measure dimensions (like Input/Textarea)
  useEffect(() => {
    if (!triggerRef.current) return

    const measure = () => {
      if (!triggerRef.current) return
      // Use offsetWidth/offsetHeight - these give layout dimensions without transform effects
      setDims({ width: triggerRef.current.offsetWidth, height: triggerRef.current.offsetHeight })
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(triggerRef.current)
    return () => observer.disconnect()
  }, [])

  // Draw sketchy border when dimensions or focus change
  useEffect(() => {
    if (!svgRef.current || dims.width === 0) return

    const svg = svgRef.current
    while (svg.firstChild) svg.removeChild(svg.firstChild)

    const rc = rough.svg(svg)
    const styles = getComputedStyle(document.documentElement)
    const strokeColor = isFocused
      ? styles.getPropertyValue("--scribble-stroke-accent").trim() || "#e07a5f"
      : styles.getPropertyValue("--scribble-stroke").trim() || "#1a1a1a"

    const border = rc.rectangle(2, 2, dims.width - 4, dims.height - 4, {
      roughness: 1.2,
      bowing: 1,
      stroke: strokeColor,
      strokeWidth: isFocused ? 2.5 : 2,
      seed: 42,
    })
    svg.appendChild(border)
  }, [dims, isFocused])

  return (
    <SelectPrimitive.Trigger
      ref={triggerRef}
      className={cn(
        "relative flex h-10 w-full items-center justify-between pl-3 pr-8 py-2 text-sm",
        "bg-transparent text-gray-900 dark:text-gray-100",
        "focus:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "[&>span]:line-clamp-1",
        className
      )}
      style={{ fontFamily: "var(--font-handwriting)" }}
      onFocus={(e) => {
        setIsFocused(true)
        props.onFocus?.(e)
      }}
      onBlur={(e) => {
        setIsFocused(false)
        props.onBlur?.(e)
      }}
      {...props}
    >
      {/* Sketchy border */}
      <svg
        ref={svgRef}
        className="pointer-events-none absolute inset-0"
        width={dims.width || "100%"}
        height={dims.height || "100%"}
        style={{ overflow: "visible" }}
      />
      <span className="relative z-10 flex-1 text-left">{children}</span>
      <SelectPrimitive.Icon asChild>
        <ScribbleIcon 
          name="chevron-down" 
          size={16} 
          color="muted" 
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10" 
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
})
ScribbleSelectTrigger.displayName = SelectPrimitive.Trigger.displayName

// =============================================================================
// SELECT SCROLL BUTTONS
// =============================================================================

const ScribbleSelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ScribbleIcon name="chevron-down" size={14} className="rotate-180" />
  </SelectPrimitive.ScrollUpButton>
))
ScribbleSelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const ScribbleSelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ScribbleIcon name="chevron-down" size={14} />
  </SelectPrimitive.ScrollDownButton>
))
ScribbleSelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName

// =============================================================================
// SELECT CONTENT
// =============================================================================

const ScribbleSelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(function ScribbleSelectContent({ className, children, position = "popper", ...props }, ref) {
  const svgRef = useRef<SVGSVGElement>(null)

  // Draw border when content node is attached
  const drawBorder = React.useCallback((node: HTMLDivElement | null) => {
    if (!node || !svgRef.current) return

    // Wait for next frame to ensure layout is complete
    requestAnimationFrame(() => {
      const svg = svgRef.current
      if (!svg) return

      // Use offsetWidth/offsetHeight - these give layout dimensions without transform effects
      const width = node.offsetWidth
      const height = node.offsetHeight
      if (width === 0) return

      while (svg.firstChild) svg.removeChild(svg.firstChild)

      const rc = rough.svg(svg)
      const styles = getComputedStyle(document.documentElement)
      const strokeColor =
        styles.getPropertyValue("--scribble-stroke").trim() || "#1a1a1a"

      // Draw border at (4,4) to account for -inset-1 positioning
      const border = rc.rectangle(4, 4, width, height, {
        roughness: 1.2,
        bowing: 1,
        stroke: strokeColor,
        strokeWidth: 2,
        seed: 55,
      })
      svg.appendChild(border)
    })
  }, [])

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={(node) => {
          // Forward ref
          if (typeof ref === "function") ref(node)
          else if (ref) ref.current = node
          // Draw border
          drawBorder(node)
        }}
        className={cn(
          "relative z-50 max-h-96 min-w-[8rem] overflow-hidden p-0",
          "bg-[#fffef8] dark:bg-gray-900 shadow-md",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        {...props}
      >
        {/* Sketchy border - extends outside content bounds */}
        <svg
          ref={svgRef}
          className="pointer-events-none absolute -inset-1"
          style={{ overflow: "visible", width: "calc(100% + 8px)", height: "calc(100% + 8px)" }}
        />

        <SelectPrimitive.Viewport
          className={cn(
            "p-0 relative z-10",
            position === "popper" &&
              "w-full min-w-[var(--radix-select-trigger-width)]"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
})

// =============================================================================
// SELECT LABEL
// =============================================================================

const ScribbleSelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn(
      "py-1.5 pl-2 pr-2 text-xs font-medium text-gray-500 dark:text-gray-400",
      className
    )}
    style={{ fontFamily: "var(--font-handwriting)" }}
    {...props}
  />
))
ScribbleSelectLabel.displayName = SelectPrimitive.Label.displayName

// =============================================================================
// SELECT ITEM
// =============================================================================

const ScribbleSelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(function ScribbleSelectItem({ className, children, ...props }, ref) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center py-2 pl-3 pr-8 text-sm outline-none",
        "text-gray-600 dark:text-gray-400",
        "transition-colors",
        "hover:text-gray-900 dark:hover:text-gray-100",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      style={{ fontFamily: "var(--font-handwriting)" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      <span className="absolute right-2 flex h-4 w-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <ScribbleIcon name="check" size={14} color="accent" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <ScribbleUnderline
        show={isHovered}
        color="accent"
        strokeWidth={2}
        duration={200}
      >
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      </ScribbleUnderline>
    </SelectPrimitive.Item>
  )
})

// =============================================================================
// SELECT SEPARATOR
// =============================================================================

const ScribbleSelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-gray-200 dark:bg-gray-700", className)}
    {...props}
  />
))
ScribbleSelectSeparator.displayName = SelectPrimitive.Separator.displayName

// =============================================================================
// EXPORTS
// =============================================================================

export {
  ScribbleSelect,
  ScribbleSelectGroup,
  ScribbleSelectValue,
  ScribbleSelectTrigger,
  ScribbleSelectContent,
  ScribbleSelectLabel,
  ScribbleSelectItem,
  ScribbleSelectSeparator,
  ScribbleSelectScrollUpButton,
  ScribbleSelectScrollDownButton,
}
