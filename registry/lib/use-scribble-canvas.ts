/**
 * useScribbleCanvas - Core hook for Rough.js SVG management
 * 
 * Handles:
 * - SVG element creation and cleanup
 * - ResizeObserver for dynamic sizing
 * - Consistent API for all Scribble components
 */

import { useCallback, useEffect, useRef, useState } from "react"
import rough from "roughjs"
import type { RoughSVG } from "roughjs/bin/svg"

export interface ScribbleCanvasOptions {
  /** Roughness level (0 = smooth, 3+ = very rough) */
  roughness?: number
  /** Stroke color */
  stroke?: string
  /** Stroke width */
  strokeWidth?: number
  /** Fill color */
  fill?: string
  /** Fill style pattern */
  fillStyle?: "solid" | "hachure" | "zigzag" | "cross-hatch" | "dots"
  /** Fill weight for patterns */
  fillWeight?: number
  /** Hachure angle for patterns */
  hachureAngle?: number
  /** Hachure gap for patterns */
  hachureGap?: number
  /** Seed for consistent randomness */
  seed?: number
}

export interface ScribbleCanvasResult {
  /** Ref to attach to the SVG element */
  svgRef: React.RefObject<SVGSVGElement | null>
  /** Ref to attach to the element being measured */
  measureRef: React.RefObject<HTMLElement | null>
  /** Current dimensions of measured element */
  dims: { width: number; height: number }
  /** Rough.js SVG instance (null until mounted) */
  rc: RoughSVG | null
  /** Clear all children from SVG */
  clear: () => void
  /** Redraw trigger - increment to force redraw */
  redrawKey: number
  /** Force a redraw */
  triggerRedraw: () => void
}

export function useScribbleCanvas(): ScribbleCanvasResult {
  const svgRef = useRef<SVGSVGElement>(null)
  const measureRef = useRef<HTMLElement>(null)
  const [dims, setDims] = useState({ width: 0, height: 0 })
  const [rc, setRc] = useState<RoughSVG | null>(null)
  const [redrawKey, setRedrawKey] = useState(0)

  // Initialize Rough.js instance when SVG mounts
  useEffect(() => {
    if (svgRef.current) {
      setRc(rough.svg(svgRef.current))
    }
  }, [])

  // ResizeObserver for dimension tracking
  useEffect(() => {
    if (!measureRef.current) return

    const measure = () => {
      if (!measureRef.current) return
      const rect = measureRef.current.getBoundingClientRect()
      setDims({ width: rect.width, height: rect.height })
    }

    measure()
    const observer = new ResizeObserver(() => {
      measure()
      setRedrawKey(k => k + 1)
    })
    observer.observe(measureRef.current)

    return () => observer.disconnect()
  }, [])

  // Clear SVG children
  const clear = useCallback(() => {
    if (svgRef.current) {
      while (svgRef.current.firstChild) {
        svgRef.current.removeChild(svgRef.current.firstChild)
      }
    }
  }, [])

  // Force redraw
  const triggerRedraw = useCallback(() => {
    setRedrawKey(k => k + 1)
  }, [])

  return {
    svgRef,
    measureRef,
    dims,
    rc,
    clear,
    redrawKey,
    triggerRedraw,
  }
}

/**
 * Helper to get default Rough.js options from CSS variables
 */
export function getScribbleDefaults(): ScribbleCanvasOptions {
  if (typeof window === "undefined") {
    return {
      roughness: 1.5,
      stroke: "#1a1a1a",
      strokeWidth: 2,
      fillStyle: "hachure",
    }
  }

  const styles = getComputedStyle(document.documentElement)
  
  return {
    roughness: parseFloat(styles.getPropertyValue("--scribble-roughness")) || 1.5,
    stroke: styles.getPropertyValue("--scribble-stroke").trim() || "#1a1a1a",
    strokeWidth: parseFloat(styles.getPropertyValue("--scribble-stroke-width")) || 2,
    fillStyle: (styles.getPropertyValue("--scribble-fill-style").trim() as ScribbleCanvasOptions["fillStyle"]) || "hachure",
    fillWeight: parseFloat(styles.getPropertyValue("--scribble-fill-weight")) || 1,
    hachureAngle: parseFloat(styles.getPropertyValue("--scribble-hachure-angle")) || -41,
    hachureGap: parseFloat(styles.getPropertyValue("--scribble-hachure-gap")) || 4,
  }
}

/**
 * Merge user options with defaults
 */
export function mergeScribbleOptions(
  userOptions: Partial<ScribbleCanvasOptions>,
  defaults = getScribbleDefaults()
): ScribbleCanvasOptions {
  return {
    ...defaults,
    ...userOptions,
  }
}
