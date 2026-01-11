/**
 * ScribbleLabel - Label with handwriting font
 * 
 * Uses @radix-ui/react-label for accessibility.
 * Themed via CSS variables.
 */

import { Label as LabelPrimitive } from "radix-ui"
import { forwardRef } from "react"

import { cn } from "./lib/utils"

export interface ScribbleLabelProps extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
  /** Required field indicator */
  required?: boolean
}

export const ScribbleLabel = forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  ScribbleLabelProps
>(function ScribbleLabel({ className, children, required, ...props }, ref) {
  return (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(
        "font-handwriting text-gray-700 dark:text-gray-300 mb-2 block",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      style={{ fontSize: "1.15rem" }}
      {...props}
    >
      {children}
      {required && (
        <span 
          className="ml-1" 
          style={{ color: "var(--scribble-stroke-accent)" }}
          aria-hidden="true"
        >
          *
        </span>
      )}
    </LabelPrimitive.Root>
  )
})
