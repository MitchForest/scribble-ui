/**
 * ScribbleToggle - Hand-drawn toggle switch
 * 
 * Features:
 * - Sketchy track and knob using Rough.js
 * - Smooth sliding animation
 * - Hover wobble effect
 * - Accessible (role="switch", aria-checked)
 * - Themed via CSS variables
 */

import { forwardRef, useEffect, useRef, useState } from "react"
import rough from "roughjs"

import { cn } from "./lib/utils"

export interface ScribbleToggleProps {
  /** Controlled checked state */
  checked?: boolean
  /** Default checked state (uncontrolled) */
  defaultChecked?: boolean
  /** Callback when checked state changes */
  onCheckedChange?: (checked: boolean) => void
  /** Active (checked) color */
  activeColor?: "accent" | "success" | string
  /** Inactive (unchecked) color */
  inactiveColor?: string
  /** Toggle size */
  size?: "sm" | "md"
  /** Disabled state */
  disabled?: boolean
  /** Roughness level */
  roughness?: number
  /** Accessible label */
  "aria-label"?: string
  /** Additional class names */
  className?: string
}

const sizeConfig = {
  sm: { width: 44, height: 24, knobSize: 16 },
  md: { width: 56, height: 28, knobSize: 18 },
}

const colorMap: Record<string, string> = {
  accent: "var(--scribble-stroke-accent)",
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

export const ScribbleToggle = forwardRef<HTMLButtonElement, ScribbleToggleProps>(
  function ScribbleToggle(
    {
      checked: controlledChecked,
      defaultChecked = false,
      onCheckedChange,
      activeColor = "accent",
      inactiveColor = "#e8e8e8",
      size = "md",
      disabled = false,
      roughness = 1.2,
      "aria-label": ariaLabel,
      className,
    },
    ref
  ) {
    // Handle controlled vs uncontrolled
    const [internalChecked, setInternalChecked] = useState(defaultChecked)
    const isControlled = controlledChecked !== undefined
    const isChecked = isControlled ? controlledChecked : internalChecked

    const svgRef = useRef<SVGSVGElement>(null)
    const [isHovered, setIsHovered] = useState(false)

    const config = sizeConfig[size]
    const { width, height, knobSize } = config

    // Handle toggle
    const handleToggle = () => {
      if (disabled) return
      
      const newValue = !isChecked
      if (!isControlled) {
        setInternalChecked(newValue)
      }
      onCheckedChange?.(newValue)
    }

    // Draw toggle with Rough.js
    useEffect(() => {
      if (!svgRef.current) return

      const svg = svgRef.current
      while (svg.firstChild) svg.removeChild(svg.firstChild)

      const rc = rough.svg(svg)
      const computedActiveColor = getColor(activeColor)

      // Draw the track
      const track = rc.rectangle(2, 2, width - 4, height - 4, {
        roughness: isHovered ? roughness * 1.3 : roughness,
        bowing: isHovered ? 1.5 : 1,
        stroke: disabled ? "#ccc" : "#888",
        strokeWidth: 2,
        fill: isChecked ? computedActiveColor : inactiveColor,
        fillStyle: "solid",
        seed: 42,
      })
      svg.appendChild(track)

      // Draw the knob
      const knobX = isChecked ? width - knobSize : knobSize
      const knob = rc.circle(knobX, height / 2, knobSize, {
        roughness: isHovered ? roughness * 1.3 : roughness,
        stroke: disabled ? "#aaa" : "#555",
        strokeWidth: 2,
        fill: "#fff",
        fillStyle: "solid",
        seed: isHovered ? 99 : 77,
      })
      svg.appendChild(knob)
    }, [isChecked, isHovered, disabled, width, height, knobSize, activeColor, inactiveColor, roughness])

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={isChecked}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={handleToggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "inline-flex items-center justify-center transition-transform",
          "hover:scale-105 active:scale-95",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--scribble-stroke-accent)]",
          disabled && "opacity-50 cursor-not-allowed hover:scale-100 active:scale-100",
          className
        )}
      >
        <svg
          ref={svgRef}
          width={width}
          height={height}
          style={{ overflow: "visible" }}
        />
      </button>
    )
  }
)
