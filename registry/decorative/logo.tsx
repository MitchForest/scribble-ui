/**
 * ScribbleLogo - Hand-drawn logo with Rough.js brackets
 *
 * Features:
 * - Text with hand-drawn brackets around it
 * - Coral accent color for brackets
 * - Responsive sizing
 */

import { useEffect, useRef, useState } from "react"
import rough from "roughjs"
import { cn } from "./lib/utils"

export interface ScribbleLogoProps {
  /** Size variant */
  size?: "sm" | "md" | "lg"
  /** Additional class names */
  className?: string
}

const sizeConfig = {
  sm: { fontSize: "text-2xl", padding: 16, bracketWidth: 10, strokeWidth: 2.5 },
  md: { fontSize: "text-3xl", padding: 20, bracketWidth: 14, strokeWidth: 3 },
  lg: { fontSize: "text-4xl", padding: 26, bracketWidth: 16, strokeWidth: 3.5 },
}

export function ScribbleLogo({ size = "md", className }: ScribbleLogoProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const [dims, setDims] = useState({ width: 0, height: 0 })

  const config = sizeConfig[size]

  useEffect(() => {
    if (!textRef.current) return

    const measure = () => {
      if (!textRef.current) return
      const rect = textRef.current.getBoundingClientRect()
      setDims({ width: rect.width, height: rect.height })
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(textRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!svgRef.current || dims.width === 0) return

    const svg = svgRef.current
    while (svg.firstChild) svg.removeChild(svg.firstChild)

    const rc = rough.svg(svg)
    const { padding, bracketWidth } = config

    // Get accent color
    const styles = getComputedStyle(document.documentElement)
    const accentColor =
      styles.getPropertyValue("--scribble-stroke-accent").trim() || "#e07a5f"

    // Left bracket [
    const leftBracket = rc.linearPath(
      [
        [padding + bracketWidth, padding],
        [padding, padding],
        [padding, dims.height + padding],
        [padding + bracketWidth, dims.height + padding],
      ],
      {
        roughness: 1.2,
        stroke: accentColor,
        strokeWidth: config.strokeWidth,
        seed: 1,
      }
    )

    // Right bracket ]
    const rightX = dims.width + padding + 20
    const rightBracket = rc.linearPath(
      [
        [rightX - bracketWidth, padding],
        [rightX, padding],
        [rightX, dims.height + padding],
        [rightX - bracketWidth, dims.height + padding],
      ],
      {
        roughness: 1.2,
        stroke: accentColor,
        strokeWidth: config.strokeWidth,
        seed: 2,
      }
    )

    svg.appendChild(leftBracket)
    svg.appendChild(rightBracket)
  }, [dims, config])

  return (
    <span className={cn("relative inline-flex items-center", className)}>
      <svg
        ref={svgRef}
        className="pointer-events-none absolute"
        width={dims.width + config.padding * 2 + 28}
        height={dims.height + config.padding * 2}
        style={{
          overflow: "visible",
          left: -(config.padding + 8),
          top: -config.padding,
        }}
      />
      <span
        ref={textRef}
        className={cn("relative text-gray-800 dark:text-gray-200", config.fontSize)}
        style={{ fontFamily: "var(--font-logo-print, Caveat, cursive)" }}
      >
        Scribble
      </span>
    </span>
  )
}
