/**
 * ScribbleBracket - Animated hand-drawn bracket
 * 
 * Wraps react-rough-notation with better DX and theming.
 */

import type { ReactNode } from "react"
import { RoughNotation } from "react-rough-notation"

type BracketPosition = "left" | "right" | "top" | "bottom"

export interface ScribbleBracketProps {
  children: ReactNode
  /** Whether to show the annotation */
  show?: boolean
  /** Which sides to show brackets on */
  brackets?: BracketPosition | Array<BracketPosition>
  /** Color preset or custom color */
  color?: "accent" | "muted" | "success" | "warning" | "error" | string
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

export function ScribbleBracket({
  children,
  show = true,
  brackets = ["left", "right"],
  color = "accent",
  strokeWidth = 2,
  duration = 800,
  delay = 0,
  animate = true,
  animationKey,
}: ScribbleBracketProps) {
  const bracketArray = Array.isArray(brackets) ? brackets : [brackets]
  
  return (
    <RoughNotation
      key={animationKey}
      type="bracket"
      show={show}
      brackets={bracketArray}
      color={getColor(color)}
      strokeWidth={strokeWidth}
      animationDuration={animate ? duration : 0}
      animationDelay={delay}
    >
      {children}
    </RoughNotation>
  )
}

