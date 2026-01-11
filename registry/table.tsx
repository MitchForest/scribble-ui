/**
 * ScribbleTable - Hand-drawn table with sketchy borders
 *
 * A simple table component matching shadcn's API but with Scribble UI styling.
 * Uses CSS for the sketchy aesthetic rather than Rough.js for performance
 * with large datasets.
 *
 * Features:
 * - Sketchy underlines for header and rows
 * - Handwriting fonts
 * - Hover states with subtle highlight
 * - Consistent with other Scribble UI components
 */

import * as React from "react"

import { cn } from "./lib/utils"

// =============================================================================
// TABLE CONTAINER
// =============================================================================

export type ScribbleTableProps = React.ComponentProps<"table">

export function ScribbleTable({ className, ...props }: ScribbleTableProps) {
  return (
    <div className="relative w-full overflow-x-auto">
      <table
        className={cn(
          "w-full caption-bottom text-sm",
          "font-handwriting",
          className
        )}
        {...props}
      />
    </div>
  )
}

// =============================================================================
// TABLE HEADER
// =============================================================================

export type ScribbleTableHeaderProps = React.ComponentProps<"thead">

export function ScribbleTableHeader({ className, ...props }: ScribbleTableHeaderProps) {
  return (
    <thead
      className={cn(
        // Sketchy bottom border using pseudo-element
        "[&_tr]:border-b-2 [&_tr]:border-gray-300 dark:[&_tr]:border-gray-600",
        "[&_tr]:border-dashed",
        className
      )}
      {...props}
    />
  )
}

// =============================================================================
// TABLE BODY
// =============================================================================

export type ScribbleTableBodyProps = React.ComponentProps<"tbody">

export function ScribbleTableBody({ className, ...props }: ScribbleTableBodyProps) {
  return (
    <tbody
      className={cn(
        "[&_tr:last-child]:border-0",
        className
      )}
      {...props}
    />
  )
}

// =============================================================================
// TABLE FOOTER
// =============================================================================

export type ScribbleTableFooterProps = React.ComponentProps<"tfoot">

export function ScribbleTableFooter({ className, ...props }: ScribbleTableFooterProps) {
  return (
    <tfoot
      className={cn(
        "border-t-2 border-dashed border-gray-300 dark:border-gray-600",
        "font-medium",
        "[&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

// =============================================================================
// TABLE ROW
// =============================================================================

export type ScribbleTableRowProps = React.ComponentProps<"tr">

export function ScribbleTableRow({ className, ...props }: ScribbleTableRowProps) {
  return (
    <tr
      className={cn(
        // Bottom border with sketchy style
        "border-b border-gray-200 dark:border-gray-700",
        // Hover state with warm highlight
        "transition-colors duration-150",
        "hover:bg-amber-50/50 dark:hover:bg-amber-900/10",
        // Selected state
        "data-[state=selected]:bg-amber-100/50 dark:data-[state=selected]:bg-amber-900/20",
        className
      )}
      {...props}
    />
  )
}

// =============================================================================
// TABLE HEAD (th)
// =============================================================================

export type ScribbleTableHeadProps = React.ComponentProps<"th">

export function ScribbleTableHead({ className, ...props }: ScribbleTableHeadProps) {
  return (
    <th
      className={cn(
        "h-12 px-3 text-left align-middle",
        "font-semibold whitespace-nowrap",
        "text-gray-700 dark:text-gray-300",
        // Checkbox column adjustment
        "[&:has([role=checkbox])]:pr-0",
        className
      )}
      style={{ fontFamily: "var(--font-handwriting-heading)" }}
      {...props}
    />
  )
}

// =============================================================================
// TABLE CELL (td)
// =============================================================================

export type ScribbleTableCellProps = React.ComponentProps<"td">

export function ScribbleTableCell({ className, ...props }: ScribbleTableCellProps) {
  return (
    <td
      className={cn(
        "p-3 align-middle",
        "text-gray-600 dark:text-gray-400",
        // Checkbox column adjustment
        "[&:has([role=checkbox])]:pr-0",
        className
      )}
      style={{ fontFamily: "var(--font-handwriting-body)" }}
      {...props}
    />
  )
}

// =============================================================================
// TABLE CAPTION
// =============================================================================

export type ScribbleTableCaptionProps = React.ComponentProps<"caption">

export function ScribbleTableCaption({ className, ...props }: ScribbleTableCaptionProps) {
  return (
    <caption
      className={cn(
        "mt-4 text-sm text-gray-500 dark:text-gray-400",
        className
      )}
      style={{ fontFamily: "var(--font-handwriting-body)" }}
      {...props}
    />
  )
}
