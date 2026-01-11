/**
 * ScribbleHighlight - Animated hand-drawn highlight
 * 
 * Wraps react-rough-notation with better DX and theming.
 */

import type { ReactNode } from "react"
import { RoughNotation } from "react-rough-notation"

export interface ScribbleHighlightProps {
  children: ReactNode
  /** Whether to show the annotation */
  show?: boolean
  /** Color preset or custom color */
  color?: "primary" | "secondary" | "success" | "warning" | "error" | string
  /** Animation duration in ms */
  duration?: number
  /** Animation delay in ms */
  delay?: number
  /** Whether to animate */
  animate?: boolean
  /** Whether text spans multiple lines */
  multiline?: boolean
  /** Key to force re-render (e.g., for font changes) */
  animationKey?: string
}

const colorMap: Record<string, string> = {
  primary: "rgba(254, 243, 199, 0.7)",   // Yellow
  secondary: "rgba(219, 234, 254, 0.7)", // Blue
  success: "rgba(209, 250, 229, 0.7)",   // Green
  warning: "rgba(251, 191, 36, 0.35)",   // Amber
  error: "rgba(254, 226, 226, 0.7)",     // Red
}

function getColor(color: string): string {
  return colorMap[color] || color
}

export function ScribbleHighlight({
  children,
  show = true,
  color = "warning",
  duration = 1000,
  delay = 0,
  animate = true,
  multiline = false,
  animationKey,
}: ScribbleHighlightProps) {
  return (
    <RoughNotation
      key={animationKey}
      type="highlight"
      show={show}
      color={getColor(color)}
      animationDuration={animate ? duration : 0}
      animationDelay={delay}
      multiline={multiline}
    >
      {children}
    </RoughNotation>
  )
}

