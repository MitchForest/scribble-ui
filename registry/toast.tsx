/**
 * ScribbleToaster - Hand-drawn toast notifications
 *
 * Uses Sonner's toast.custom() to render fully custom toasts with
 * proper Rough.js borders that we control entirely.
 */

import { useCallback, useEffect, useRef, useState } from "react"
import rough from "roughjs"
import { Toaster as Sonner, toast as sonnerToast } from "sonner"

import { ScribbleClose } from "./icons/close"

// =============================================================================
// TYPES
// =============================================================================

type ToastType = "default" | "success" | "error" | "warning" | "info"

interface ScribbleToastProps {
  id: string | number
  title?: string
  description?: string
  type?: ToastType
  action?: {
    label: string
    onClick: () => void
  }
  onDismiss?: () => void
}

// =============================================================================
// TOAST CONTENT COMPONENT
// =============================================================================

function ScribbleToastContent({
  id,
  title,
  description,
  type = "default",
  action,
  onDismiss,
}: ScribbleToastProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // Seed for consistent randomness per toast
  const seed = typeof id === "string" ? hashString(id) : id

  // Slight rotation for playful feel
  const rotation = ((seed % 5) - 2) * 0.5

  // Get border color based on type
  const getBorderColor = useCallback(() => {
    switch (type) {
      case "success": return "#059669"
      case "error": return "#dc2626"
      case "warning": return "#d97706"
      case "info": return "#3b82f6"
      default: return "#6b7280"
    }
  }, [type])

  // Get icon based on type
  const getIcon = () => {
    switch (type) {
      case "success": return "✓"
      case "error": return "✕"
      case "warning": return "!"
      case "info": return "i"
      default: return null
    }
  }

  const getIconBg = () => {
    switch (type) {
      case "success": return "#d1fae5"
      case "error": return "#fee2e2"
      case "warning": return "#fef3c7"
      case "info": return "#dbeafe"
      default: return "#f3f4f6"
    }
  }

  // Measure content and draw border
  useEffect(() => {
    if (!containerRef.current) return

    const measure = () => {
      const rect = containerRef.current!.getBoundingClientRect()
      setDimensions({ width: rect.width, height: rect.height })
    }

    measure()

    // Re-measure on resize
    const observer = new ResizeObserver(measure)
    observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [])

  // Draw Rough.js border
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return

    const svg = svgRef.current
    while (svg.firstChild) svg.removeChild(svg.firstChild)

    const rc = rough.svg(svg)
    const padding = 2
    const borderColor = getBorderColor()

    // Draw background fill first
    const bg = rc.rectangle(
      padding,
      padding,
      dimensions.width - padding * 2,
      dimensions.height - padding * 2,
      {
        roughness: 0,
        stroke: "none",
        fill: "#fffef8",
        fillStyle: "solid",
        seed: seed,
      }
    )
    svg.appendChild(bg)

    // Draw sketchy border
    const border = rc.rectangle(
      padding,
      padding,
      dimensions.width - padding * 2,
      dimensions.height - padding * 2,
      {
        roughness: 1.2,
        bowing: 1,
        stroke: borderColor,
        strokeWidth: 2,
        seed: seed + 1,
      }
    )
    svg.appendChild(border)
  }, [dimensions, getBorderColor, seed, type])

  return (
    <div
      ref={containerRef}
      className="relative min-w-[300px] max-w-[400px]"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {/* Rough.js border SVG - behind content */}
      <svg
        ref={svgRef}
        className="absolute inset-0 pointer-events-none"
        width={dimensions.width || 300}
        height={dimensions.height || 60}
        style={{ overflow: "visible" }}
      />

      {/* Content - above SVG */}
      <div className="relative z-10 flex items-start gap-3 p-4">
        {/* Icon */}
        {getIcon() && (
          <div
            className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold"
            style={{
              backgroundColor: getIconBg(),
              color: getBorderColor(),
            }}
          >
            {getIcon()}
          </div>
        )}

        {/* Text */}
        <div className="flex-1 min-w-0">
          {title && (
            <div className="font-handwriting text-lg text-gray-800 leading-tight">
              {title}
            </div>
          )}
          {description && (
            <div className="font-handwriting text-base text-gray-500 mt-0.5 leading-tight">
              {description}
            </div>
          )}
        </div>

        {/* Action button */}
        {action && (
          <button
            onClick={() => {
              action.onClick()
              sonnerToast.dismiss(id)
            }}
            className="flex-shrink-0 font-handwriting text-base px-3 py-1 bg-[#e07a5f] text-white rounded hover:bg-[#d4695a] transition-colors"
          >
            {action.label}
          </button>
        )}

        {/* Dismiss button */}
        <ScribbleClose
          size={16}
          color="muted"
          hoverColor="accent"
          onClick={() => {
            onDismiss?.()
            sonnerToast.dismiss(id)
          }}
          className="flex-shrink-0 mt-0.5"
          aria-label="Dismiss"
        />
      </div>
    </div>
  )
}

// =============================================================================
// HELPER: String hash for consistent seeds
// =============================================================================

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

// =============================================================================
// TOAST FUNCTIONS
// =============================================================================

interface ToastOptions {
  description?: string
  action?: { label: string; onClick: () => void }
  duration?: number
}

function createToast(type: ToastType) {
  return (title: string, options?: ToastOptions) => {
    return sonnerToast.custom(
      (id) => (
        <ScribbleToastContent
          id={id}
          title={title}
          description={options?.description}
          type={type}
          action={options?.action}
          onDismiss={() => sonnerToast.dismiss(id)}
        />
      ),
      {
        duration: options?.duration ?? 4000,
      }
    )
  }
}

/**
 * Scribble-styled toast functions
 *
 * Usage:
 *   toast.success("Saved!")
 *   toast.error("Something went wrong", { description: "Please try again" })
 *   toast.info("Tip", { action: { label: "Learn more", onClick: () => {} } })
 */
export const toast = {
  /** Default toast */
  default: createToast("default"),
  /** Success toast (green) */
  success: createToast("success"),
  /** Error toast (red) */
  error: createToast("error"),
  /** Warning toast (amber) */
  warning: createToast("warning"),
  /** Info toast (blue) */
  info: createToast("info"),
  /** Dismiss a specific toast */
  dismiss: sonnerToast.dismiss,
  /** Dismiss all toasts */
  dismissAll: () => sonnerToast.dismiss(),
}

// =============================================================================
// TOASTER COMPONENT
// =============================================================================

export interface ScribbleToasterProps {
  /** Position of toasts */
  position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right"
  /** Gap between toasts */
  gap?: number
}

export function ScribbleToaster({
  position = "bottom-right",
  gap = 12,
}: ScribbleToasterProps) {
  return (
    <Sonner
      position={position}
      gap={gap}
      toastOptions={{
        unstyled: true,
        className: "scribble-toast",
      }}
      style={{
        // Override Sonner's default toast styles
        // @ts-expect-error - Sonner style props
        "--toast-bg": "transparent",
        "--toast-border": "none",
      }}
    />
  )
}
