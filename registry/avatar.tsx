/**
 * ScribbleAvatar - Avatar with hand-drawn Rough.js border
 * 
 * Features:
 * - Multiple border styles (solid, dashed, double, zigzag)
 * - Built on Radix Avatar primitive for accessibility
 * - Themed via CSS variables
 */

import { forwardRef, useEffect, useRef } from "react"
import { Avatar as AvatarPrimitive } from "radix-ui"
import rough from "roughjs"
import { cn } from "./lib/utils"

export type AvatarBorderStyle = "solid" | "dashed" | "double" | "zigzag" | "none"

export interface ScribbleAvatarProps {
  /** Image source */
  src?: string
  /** Alt text for the image */
  alt?: string
  /** Fallback text (initials) when image fails to load */
  fallback?: string
  /** Avatar size */
  size?: "sm" | "md" | "lg"
  /** Border style */
  borderStyle?: AvatarBorderStyle
  /** Border color */
  borderColor?: "accent" | "muted" | "success" | string
  /** Roughness level */
  roughness?: number
  /** Seed for consistent randomness */
  seed?: number
  /** Additional class names */
  className?: string
}

const sizeConfig = {
  sm: { container: 44, avatar: 32, radius: 18, strokeWidth: 2 },
  md: { container: 60, avatar: 44, radius: 26, strokeWidth: 2.5 },
  lg: { container: 76, avatar: 56, radius: 32, strokeWidth: 3 },
}

const colorMap: Record<string, string> = {
  accent: "var(--scribble-stroke-accent)",
  muted: "var(--scribble-stroke-muted)",
  success: "var(--scribble-stroke-success)",
}

function getColor(color: string): string {
  if (color in colorMap) {
    if (typeof window !== "undefined") {
      const varName = colorMap[color].slice(4, -1)
      return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || "#e07a5f"
    }
    return "#e07a5f"
  }
  return color
}

export const ScribbleAvatar = forwardRef<HTMLSpanElement, ScribbleAvatarProps>(
  function ScribbleAvatar(
    {
      src,
      alt,
      fallback,
      size = "md",
      borderStyle = "solid",
      borderColor = "accent",
      roughness = 1.5,
      seed = 42,
      className,
    },
    ref
  ) {
    const svgRef = useRef<SVGSVGElement>(null)
    const config = sizeConfig[size]

    useEffect(() => {
      if (!svgRef.current || borderStyle === "none") return

      const svg = svgRef.current
      while (svg.firstChild) svg.removeChild(svg.firstChild)

      const rc = rough.svg(svg)
      const center = config.container / 2
      const radius = config.radius
      const computedColor = getColor(borderColor)

      switch (borderStyle) {
        case "solid": {
          const circle = rc.circle(center, center, radius * 2, {
            roughness,
            stroke: computedColor,
            strokeWidth: config.strokeWidth,
            seed,
          })
          svg.appendChild(circle)
          break
        }
        case "dashed": {
          // Draw multiple arc segments for dashed effect
          for (let i = 0; i < 6; i++) {
            const startAngle = (i * Math.PI) / 3
            const endAngle = startAngle + Math.PI / 4
            const arc = rc.arc(center, center, radius * 2, radius * 2, startAngle, endAngle, false, {
              roughness: roughness * 0.8,
              stroke: computedColor,
              strokeWidth: config.strokeWidth,
              seed: seed + i,
            })
            svg.appendChild(arc)
          }
          break
        }
        case "double": {
          // Inner circle
          const inner = rc.circle(center, center, radius * 1.7, {
            roughness: roughness * 0.85,
            stroke: computedColor,
            strokeWidth: config.strokeWidth * 0.6,
            seed,
          })
          svg.appendChild(inner)
          // Outer circle
          const outer = rc.circle(center, center, radius * 2.2, {
            roughness: roughness * 0.85,
            stroke: computedColor,
            strokeWidth: config.strokeWidth * 0.6,
            seed: seed + 1,
          })
          svg.appendChild(outer)
          break
        }
        case "zigzag": {
          // Wavy/scalloped circle effect
          const points: Array<[number, number]> = []
          const segments = 16
          for (let i = 0; i < segments; i++) {
            const angle = (i * 2 * Math.PI) / segments
            const r = i % 2 === 0 ? radius + 2 : radius - 2
            points.push([
              center + r * Math.cos(angle),
              center + r * Math.sin(angle),
            ])
          }
          const zigzag = rc.polygon(points, {
            roughness: roughness * 0.8,
            stroke: computedColor,
            strokeWidth: config.strokeWidth * 0.8,
            seed,
          })
          svg.appendChild(zigzag)
          break
        }
      }
    }, [borderStyle, borderColor, roughness, seed, config])

    return (
      <div 
        className={cn("relative inline-flex items-center justify-center", className)}
        style={{ width: config.container, height: config.container }}
      >
        {/* Rough.js border */}
        {borderStyle !== "none" && (
          <svg
            ref={svgRef}
            className="pointer-events-none absolute inset-0"
            width={config.container}
            height={config.container}
            style={{ overflow: "visible" }}
          />
        )}
        
        {/* Radix Avatar */}
        <AvatarPrimitive.Root
          ref={ref}
          className="relative z-10 inline-flex items-center justify-center overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"
          style={{ width: config.avatar, height: config.avatar }}
        >
          <AvatarPrimitive.Image
            src={src}
            alt={alt}
            className="h-full w-full object-cover"
          />
          <AvatarPrimitive.Fallback
            className="flex h-full w-full items-center justify-center font-handwriting text-gray-600 dark:text-gray-300"
            style={{ fontSize: config.avatar * 0.4 }}
            delayMs={600}
          >
            {fallback}
          </AvatarPrimitive.Fallback>
        </AvatarPrimitive.Root>
      </div>
    )
  }
)
