/**
 * ScribbleCircle - Animated hand-drawn circle around content
 * 
 * Wraps react-rough-notation with better DX and theming.
 */

import type { ReactNode } from "react"
import { RoughNotation } from "react-rough-notation"

export interface ScribbleCircleProps {
  children: ReactNode
  /** Whether to show the annotation */
  show?: boolean
  /** Color preset or custom color */
  color?: "accent" | "muted" | "success" | "warning" | "error" | string
  /** Stroke width */
  strokeWidth?: number
  /** Padding around content */
  padding?: number
  /** Animation duration in ms */
  duration?: number
  /** Animation delay in ms */
  delay?: number
  /** Whether to animate */
  animate?: boolean
  /** Key to force re-render (e.g., for font changes) */
  animationKey?: string
}

const colorMap: Record<string, string> = {
  accent: "var(--scribble-stroke-accent)",
  muted: "var(--scribble-stroke-muted)",
  success: "var(--scribble-stroke-success)",
  warning: "var(--scribble-stroke-warning)",
  error: "var(--scribble-stroke-error)",
}

function getColor(color: string): string {
  if (color in colorMap) {
    if (typeof window !== "undefined") {
      const varName = colorMap[color].slice(4, -1)
      return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || color
    }
    return color
  }
  return color
}

export function ScribbleCircle({
  children,
  show = true,
  color = "accent",
  strokeWidth = 2,
  padding = 5,
  duration = 800,
  delay = 0,
  animate = true,
  animationKey,
}: ScribbleCircleProps) {
  return (
    <RoughNotation
      key={animationKey}
      type="circle"
      show={show}
      color={getColor(color)}
      strokeWidth={strokeWidth}
      padding={padding}
      animationDuration={animate ? duration : 0}
      animationDelay={delay}
    >
      {children}
    </RoughNotation>
  )
}

