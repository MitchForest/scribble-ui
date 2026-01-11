/**
 * ScribbleAlertDialog - Hand-drawn confirmation dialog
 *
 * For destructive or important actions that require explicit user confirmation.
 * Unlike ScribbleDialog, this cannot be dismissed by clicking outside or pressing Escape.
 *
 * Features:
 * - Sketchy border with Rough.js
 * - Destructive variant with red accent
 * - Cancel/Action button pair
 * - Title in handwriting font
 *
 * Wraps: @radix-ui/react-alert-dialog
 */

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"
import * as React from "react"
import { useRef } from "react"
import rough from "roughjs"

import { ScribbleButton  } from "./button"
import type {ScribbleButtonProps} from "./button";
import { ScribbleDivider } from "./decorative/divider"
import { cn } from "./lib/utils"

// =============================================================================
// ALERT DIALOG ROOT
// =============================================================================

const ScribbleAlertDialog = AlertDialogPrimitive.Root

// =============================================================================
// ALERT DIALOG TRIGGER
// =============================================================================

const ScribbleAlertDialogTrigger = AlertDialogPrimitive.Trigger

// =============================================================================
// ALERT DIALOG PORTAL
// =============================================================================

const ScribbleAlertDialogPortal = AlertDialogPrimitive.Portal

// =============================================================================
// ALERT DIALOG OVERLAY
// =============================================================================

const ScribbleAlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
ScribbleAlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName

// =============================================================================
// ALERT DIALOG CONTENT
// =============================================================================

interface ScribbleAlertDialogContentProps
  extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content> {
  /** Use destructive (red) border styling */
  variant?: "default" | "destructive"
}

const ScribbleAlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  ScribbleAlertDialogContentProps
>(({ className, children, variant = "default", ...props }, ref) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)

  const drawBorder = React.useCallback(() => {
    const node = frameRef.current
    const svg = svgRef.current
    if (!node || !svg) return

    // Wait for animation to complete
    setTimeout(() => {
      if (!frameRef.current || !svgRef.current) return

      const width = frameRef.current.offsetWidth
      const height = frameRef.current.offsetHeight
      if (width === 0) return

      svgRef.current.setAttribute("width", String(width))
      svgRef.current.setAttribute("height", String(height))

      while (svgRef.current.firstChild) svgRef.current.removeChild(svgRef.current.firstChild)

      const rc = rough.svg(svgRef.current)
      const styles = getComputedStyle(document.documentElement)
      
      // Use red stroke for destructive variant
      const strokeColor = variant === "destructive"
        ? styles.getPropertyValue("--scribble-stroke-error").trim() || "#dc2626"
        : styles.getPropertyValue("--scribble-stroke").trim() || "#1a1a1a"

      const border = rc.rectangle(2, 2, width - 4, height - 4, {
        roughness: 1.2,
        stroke: strokeColor,
        strokeWidth: variant === "destructive" ? 2.5 : 2,
        seed: 42,
      })
      svgRef.current.appendChild(border)
    }, 250)
  }, [variant])

  return (
    <ScribbleAlertDialogPortal>
      <ScribbleAlertDialogOverlay />
      <AlertDialogPrimitive.Content
        ref={(node) => {
          if (typeof ref === "function") ref(node)
          else if (ref) ref.current = node
        }}
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2",
          "bg-[#fffef8] dark:bg-gray-900 shadow-xl",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "duration-200",
          "focus:outline-none",
          className
        )}
        {...props}
      >
        {/* Outer frame */}
        <div
          ref={(node) => {
            frameRef.current = node
            if (node) drawBorder()
          }}
          className="relative w-full"
        >
          {/* Sketchy border */}
          <svg
            ref={svgRef}
            className="pointer-events-none absolute left-0 top-0 z-30"
            style={{ overflow: "visible" }}
          />

          {/* Content */}
          <div className="w-full p-6">
            {children}
          </div>
        </div>
      </AlertDialogPrimitive.Content>
    </ScribbleAlertDialogPortal>
  )
})
ScribbleAlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName

// =============================================================================
// ALERT DIALOG HEADER
// =============================================================================

const ScribbleAlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
    {...props}
  />
)
ScribbleAlertDialogHeader.displayName = "ScribbleAlertDialogHeader"

// =============================================================================
// ALERT DIALOG FOOTER
// =============================================================================

const ScribbleAlertDialogFooter = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className="mt-6">
    <ScribbleDivider variant="line" color="muted" />
    <div
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  </div>
)
ScribbleAlertDialogFooter.displayName = "ScribbleAlertDialogFooter"

// =============================================================================
// ALERT DIALOG TITLE
// =============================================================================

const ScribbleAlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight text-gray-900 dark:text-gray-100",
      className
    )}
    style={{ fontFamily: "var(--font-handwriting)" }}
    {...props}
  />
))
ScribbleAlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName

// =============================================================================
// ALERT DIALOG DESCRIPTION
// =============================================================================

const ScribbleAlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-gray-600 dark:text-gray-400 mt-2", className)}
    style={{ fontFamily: "var(--font-handwriting-body)" }}
    {...props}
  />
))
ScribbleAlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName

// =============================================================================
// ALERT DIALOG ACTION (Confirm button)
// =============================================================================

interface ScribbleAlertDialogActionProps
  extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action> {
  /** Button variant - defaults to "primary", use "destructive" for dangerous actions */
  variant?: ScribbleButtonProps["variant"]
}

const ScribbleAlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  ScribbleAlertDialogActionProps
>(({ className, variant = "primary", children, ...props }, ref) => (
  <AlertDialogPrimitive.Action ref={ref} asChild {...props}>
    <ScribbleButton variant={variant} className={className}>
      {children}
    </ScribbleButton>
  </AlertDialogPrimitive.Action>
))
ScribbleAlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName

// =============================================================================
// ALERT DIALOG CANCEL
// =============================================================================

const ScribbleAlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, children, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel ref={ref} asChild {...props}>
    <ScribbleButton variant="outline" className={className}>
      {children}
    </ScribbleButton>
  </AlertDialogPrimitive.Cancel>
))
ScribbleAlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName

// =============================================================================
// EXPORTS
// =============================================================================

export {
  ScribbleAlertDialog,
  ScribbleAlertDialogPortal,
  ScribbleAlertDialogOverlay,
  ScribbleAlertDialogTrigger,
  ScribbleAlertDialogContent,
  ScribbleAlertDialogHeader,
  ScribbleAlertDialogFooter,
  ScribbleAlertDialogTitle,
  ScribbleAlertDialogDescription,
  ScribbleAlertDialogAction,
  ScribbleAlertDialogCancel,
}
