/**
 * ScribbleStickyNote - Hand-drawn sticky note with rough edges
 * 
 * Features:
 * - Irregular hand-drawn edges
 * - Optional tape at top with torn edges
 * - Optional crease lines (custom positions)
 * - Optional corner curl (any corner)
 * - Hover effect with shadow/rotation
 */

import { useEffect, useMemo, useRef, useState } from "react"
import type { ReactNode } from "react";
import rough from "roughjs"

import { cn } from "../lib/utils"

export interface CreaseConfig {
  x1: number
  y1: number
  x2: number
  y2: number
}

export interface ScribbleStickyNoteProps {
  children: ReactNode
  /** Note color preset or hex */
  color?: "yellow" | "pink" | "green" | "blue" | string
  /** Rotation in degrees */
  rotation?: number
  /** Width in pixels */
  width?: number
  /** Height in pixels */
  height?: number
  /** Roughness level */
  roughness?: number
  /** Seed for consistent randomness */
  seed?: number
  /** Show corner curl */
  showCurl?: boolean
  /** Corner for the curl */
  curlCorner?: "bottom-right" | "top-right" | "bottom-left" | "top-left"
  /** Show crease lines */
  showCreases?: boolean
  /** Custom crease positions (overrides showCreases) */
  creaseConfig?: Array<CreaseConfig>
  /** Show tape at top */
  showTape?: boolean
  /** Enable hover effects (shadow, rotation reset) */
  hoverEffect?: boolean
  /** Additional class names */
  className?: string
}

const colorMap: Record<string, { bg: string; darker: string }> = {
  yellow: { bg: "#fff9c4", darker: "#f0e68c" },
  pink: { bg: "#ffcdd2", darker: "#ef9a9a" },
  green: { bg: "#c8e6c9", darker: "#a5d6a7" },
  blue: { bg: "#bbdefb", darker: "#90caf9" },
}

export function ScribbleStickyNote({
  children,
  color = "yellow",
  rotation = 0,
  width = 160,
  height = 120,
  roughness = 1.4,
  seed = 42,
  showCurl = false,
  curlCorner = "bottom-right",
  showCreases = false,
  creaseConfig,
  showTape = false,
  hoverEffect = true,
  className,
}: ScribbleStickyNoteProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const colors = useMemo(() => {
    return color in colorMap ? colorMap[color] : { bg: color, darker: color }
  }, [color])

  useEffect(() => {
    if (!svgRef.current) return

    const svg = svgRef.current
    while (svg.firstChild) svg.removeChild(svg.firstChild)

    const rc = rough.svg(svg)
    
    // Seed-based pseudo-random for consistent irregular edges
    const seededOffset = (s: number) => ((s * 9301 + 49297) % 233280) / 233280
    const padding = 6
    
    // Irregular polygon points for hand-drawn look
    const points: Array<[number, number]> = [
      [padding + seededOffset(seed) * 4, padding + seededOffset(seed + 1) * 3],
      [width - padding - seededOffset(seed + 2) * 5, padding + seededOffset(seed + 3) * 4],
      [width - padding - seededOffset(seed + 4) * 3, height - padding - seededOffset(seed + 5) * 4],
      [padding + seededOffset(seed + 6) * 4, height - padding - seededOffset(seed + 7) * 5],
    ]
    
    // Shadow behind the note
    const shadowPoints: Array<[number, number]> = points.map(([x, y]) => [x + 3, y + 4])
    const shadow = rc.polygon(shadowPoints, {
      roughness: 0.5,
      stroke: "none",
      fill: "rgba(0,0,0,0.08)",
      fillStyle: "solid",
      seed: seed + 5,
    })
    svg.appendChild(shadow)
    
    // Draw the sticky note with more roughness
    const note = rc.polygon(points, {
      roughness: isHovered && hoverEffect ? roughness * 1.3 : roughness,
      bowing: isHovered && hoverEffect ? 2 : 1.5,
      stroke: "rgba(0,0,0,0.18)",
      strokeWidth: 1.5,
      fill: colors.bg,
      fillStyle: "solid",
      seed: isHovered && hoverEffect ? seed + 50 : seed,
    })
    svg.appendChild(note)
    
    // Crease lines (custom config takes priority)
    const creases = creaseConfig ?? (showCreases ? [
      { x1: padding + 12, y1: padding + 20, x2: width - padding - 15, y2: padding + 24 },
      { x1: padding + 18, y1: height - padding - 18, x2: width - padding - 12, y2: height - padding - 14 },
    ] : [])
    
    creases.forEach((crease, i) => {
      const creaseLine = rc.line(crease.x1, crease.y1, crease.x2, crease.y2, {
        roughness: 1.5,
        stroke: "rgba(0,0,0,0.06)",
        strokeWidth: 0.8,
        seed: seed + 20 + i,
      })
      svg.appendChild(creaseLine)
    })
    
    // Corner curl
    if (showCurl) {
      const curlSize = 14
      let curlPoints: Array<[number, number]> = []
      let curlLineStart: [number, number] = [0, 0]
      let curlLineEnd: [number, number] = [0, 0]
      
      switch (curlCorner) {
        case "bottom-right": {
          const x = width - padding - 2
          const y = height - padding - 2
          curlPoints = [[x, y - curlSize], [x, y], [x - curlSize, y]]
          curlLineStart = [x - curlSize, y]
          curlLineEnd = [x, y - curlSize]
          break
        }
        case "top-right": {
          const x = width - padding - 2
          const y = padding + 2
          curlPoints = [[x, y + curlSize], [x, y], [x - curlSize, y]]
          curlLineStart = [x - curlSize, y]
          curlLineEnd = [x, y + curlSize]
          break
        }
        case "bottom-left": {
          const x = padding + 2
          const y = height - padding - 2
          curlPoints = [[x, y - curlSize], [x, y], [x + curlSize, y]]
          curlLineStart = [x + curlSize, y]
          curlLineEnd = [x, y - curlSize]
          break
        }
        case "top-left": {
          const x = padding + 2
          const y = padding + 2
          curlPoints = [[x, y + curlSize], [x, y], [x + curlSize, y]]
          curlLineStart = [x + curlSize, y]
          curlLineEnd = [x, y + curlSize]
          break
        }
      }
      
      const curl = rc.polygon(curlPoints, {
        roughness: 1.2,
        stroke: "rgba(0,0,0,0.15)",
        strokeWidth: 1,
        fill: colors.darker,
        fillStyle: "solid",
        seed: seed + 25,
      })
      svg.appendChild(curl)
      
      const curlLine = rc.line(curlLineStart[0], curlLineStart[1], curlLineEnd[0], curlLineEnd[1], {
        roughness: 1,
        stroke: "rgba(0,0,0,0.1)",
        strokeWidth: 0.8,
        seed: seed + 26,
      })
      svg.appendChild(curlLine)
    }
    
    // Tape at top with torn edges
    if (showTape) {
      const tapeWidth = 50
      const tapeHeight = 14
      const tapeX = (width - tapeWidth) / 2
      
      const tapePoints: Array<[number, number]> = [
        [tapeX - 3, 0],
        [tapeX + 5, -4],
        [tapeX + tapeWidth - 5, -3],
        [tapeX + tapeWidth + 2, 1],
        [tapeX + tapeWidth + 1, tapeHeight - 2],
        [tapeX + tapeWidth - 6, tapeHeight],
        [tapeX + 8, tapeHeight - 1],
        [tapeX - 2, tapeHeight - 2],
      ]
      const tape = rc.polygon(tapePoints, {
        roughness: 1.3,
        stroke: "rgba(150, 130, 90, 0.4)",
        strokeWidth: 1,
        fill: "rgba(255, 248, 220, 0.75)",
        fillStyle: "solid",
        seed: seed + 10,
      })
      svg.appendChild(tape)
    }
  }, [width, height, colors, roughness, seed, isHovered, showCurl, curlCorner, showCreases, creaseConfig, showTape, hoverEffect])

  return (
    <div
      className={cn("relative cursor-pointer transition-all duration-200", className)}
      style={{ 
        width, 
        height, 
        transform: `rotate(${isHovered && hoverEffect ? 0 : rotation}deg)`,
        filter: hoverEffect 
          ? (isHovered ? "drop-shadow(0 6px 12px rgba(0,0,0,0.12))" : "drop-shadow(0 3px 6px rgba(0,0,0,0.08))")
          : undefined,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="pointer-events-none absolute inset-0"
        style={{ overflow: "visible" }}
      />
      <div className="relative z-10 flex h-full w-full items-center justify-center p-4">
        {children}
      </div>
    </div>
  )
}
