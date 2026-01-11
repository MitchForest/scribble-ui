/**
 * ScribbleCrossedOff - Animated crossed-off/strikethrough effect
 * 
 * Wraps react-rough-notation with better DX and theming.
 */

import type { ReactNode } from "react"
import { RoughNotation } from "react-rough-notation"

export interface ScribbleCrossedOffProps {
  children: ReactNode
  /** Whether to show the annotation */
  show?: boolean
  /** Color preset or custom color */
  color?: "accent" | "muted" | "error" | string
  /** Stroke width */
  strokeWidth?: number
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

export function ScribbleCrossedOff({
  children,
  show = true,
  color = "error",
  strokeWidth = 2,
  duration = 600,
  delay = 0,
  animate = true,
  animationKey,
}: ScribbleCrossedOffProps) {
  return (
    <RoughNotation
      key={animationKey}
      type="crossed-off"
      show={show}
      color={getColor(color)}
      strokeWidth={strokeWidth}
      animationDuration={animate ? duration : 0}
      animationDelay={delay}
    >
      {children}
    </RoughNotation>
  )
}

