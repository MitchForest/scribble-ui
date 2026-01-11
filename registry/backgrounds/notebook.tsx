/**
 * ScribbleNotebook - Lined notebook paper background
 * 
 * Creates the effect of writing on actual lined paper with:
 * - Blue horizontal lines
 * - Red margin line
 * - Punch holes
 */

import type { ReactNode } from "react"

import { cn } from "../lib/utils"

export interface ScribbleNotebookProps {
  children: ReactNode
  /** Line height in pixels */
  lineHeight?: number
  /** Margin from left edge in pixels */
  marginLeft?: number
  /** Spacing between punch holes */
  holeSpacing?: number
  /** Number of punch holes to render */
  holeCount?: number
  /** Line color */
  lineColor?: string
  /** Margin line color */
  marginColor?: string
  /** Background color */
  backgroundColor?: string
  /** Additional class names */
  className?: string
}

export function ScribbleNotebook({
  children,
  lineHeight = 32,
  marginLeft = 80,
  holeSpacing = 240,
  holeCount = 15,
  lineColor = "#c8dff5",
  marginColor = "#e8a0a0",
  backgroundColor = "#fff",
  className,
}: ScribbleNotebookProps) {
  return (
    <div 
      className={cn("relative min-h-screen overflow-hidden", className)}
      style={{
        backgroundColor,
        // Blue horizontal lines as repeating background
        backgroundImage: `
          repeating-linear-gradient(
            to bottom,
            transparent,
            transparent ${lineHeight - 1}px,
            ${lineColor} ${lineHeight - 1}px,
            ${lineColor} ${lineHeight}px
          )
        `,
        backgroundSize: `100% ${lineHeight}px`,
      }}
    >
      {/* Red margin line - scrolls with content, hidden on mobile */}
      <div 
        className="pointer-events-none absolute left-0 top-0 bottom-0 w-[2px] hidden md:block"
        style={{ 
          marginLeft,
          backgroundColor: marginColor,
        }}
      />

      {/* Punch holes - repeating down the page (behind content), hidden on mobile */}
      <div className="hidden md:block">
        <PunchHoles holeCount={holeCount} holeSpacing={holeSpacing} />
      </div>

      {/* Content - above punch holes */}
      <div className="relative" style={{ zIndex: 2 }}>
        {children}
      </div>
    </div>
  )
}

/**
 * Renders punch holes down the left side of the paper.
 */
function PunchHoles({ 
  holeCount, 
  holeSpacing 
}: { 
  holeCount: number
  holeSpacing: number 
}) {
  return (
    <div className="pointer-events-none absolute left-0 top-0 h-full" style={{ zIndex: 1 }}>
      {Array.from({ length: holeCount }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: 20,
            top: 80 + i * holeSpacing,
            width: 20,
            height: 20,
            background: 'radial-gradient(circle at 40% 40%, #f8f8f8 0%, #e0e0e0 60%, #ccc 100%)',
            boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.15)',
          }}
        />
      ))}
    </div>
  )
}

