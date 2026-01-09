/**
 * ScribbleCheckbox - Hand-drawn checkbox
 * 
 * Features:
 * - Sketchy square border using Rough.js
 * - Hand-drawn checkmark when checked
 * - Hover wobble effect (redraw with different seed)
 * - Focus ring for accessibility
 * - Themed via CSS variables
 */

import { forwardRef, useEffect, useRef, useState } from "react"
import rough from "roughjs"
import { cn } from "./lib/utils"

export interface ScribbleCheckboxProps {
  /** Controlled checked state */
  checked?: boolean
  /** Default checked state (uncontrolled) */
  defaultChecked?: boolean
  /** Callback when checked state changes */
  onCheckedChange?: (checked: boolean) => void
  /** Disabled state */
  disabled?: boolean
  /** Checkbox size */
  size?: "sm" | "md"
  /** Checked color */
  color?: "default" | "accent"
  /** Roughness level */
  roughness?: number
  /** Input id for label association */
  id?: string
  /** Accessible label */
  "aria-label"?: string
  /** Additional class names */
  className?: string
}

const sizeConfig = {
  sm: { box: 18, stroke: 1.5, checkStroke: 2 },
  md: { box: 22, stroke: 2, checkStroke: 2.5 },
}

const colorMap: Record<string, string> = {
  default: "#374151",
  accent: "#e07a5f",
}

function getColor(color: string): string {
  if (color in colorMap) {
    return colorMap[color]
  }
  return color
}

export const ScribbleCheckbox = forwardRef<HTMLButtonElement, ScribbleCheckboxProps>(
  function ScribbleCheckbox(
    {
      checked: controlledChecked,
      defaultChecked = false,
      onCheckedChange,
      disabled = false,
      size = "md",
      color = "accent",
      roughness = 1.2,
      id,
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
    const [drawCount, setDrawCount] = useState(0)

    const config = sizeConfig[size]
    const { box, stroke, checkStroke } = config

    // Handle toggle
    const handleToggle = () => {
      if (disabled) return
      
      const newValue = !isChecked
      if (!isControlled) {
        setInternalChecked(newValue)
      }
      onCheckedChange?.(newValue)
    }

    // Trigger redraw on hover for wobble effect
    useEffect(() => {
      setDrawCount(c => c + 1)
    }, [isHovered])

    // Draw checkbox with Rough.js
    useEffect(() => {
      if (!svgRef.current) return

      const svg = svgRef.current
      while (svg.firstChild) svg.removeChild(svg.firstChild)

      const rc = rough.svg(svg)
      const checkedColor = getColor(color)
      const borderColor = disabled ? "#ccc" : (isChecked ? checkedColor : "#888")
      const baseSeed = drawCount * 10 + (isHovered ? 50 : 0)
      const currentRoughness = isHovered ? roughness * 1.4 : roughness

      // Draw the checkbox box
      const boxElement = rc.rectangle(2, 2, box - 4, box - 4, {
        roughness: currentRoughness,
        bowing: isHovered ? 1.5 : 1,
        stroke: borderColor,
        strokeWidth: stroke,
        fill: isChecked ? checkedColor : "#fff",
        fillStyle: "solid",
        seed: baseSeed,
      })
      svg.appendChild(boxElement)

      // Draw checkmark if checked
      if (isChecked) {
        // Hand-drawn checkmark path: start from left-middle, down-right to bottom, up-right to top
        const padding = 2
        const innerSize = box - padding * 2
        const startX = padding + innerSize * 0.2
        const startY = padding + innerSize * 0.5
        const midX = padding + innerSize * 0.4
        const midY = padding + innerSize * 0.7
        const endX = padding + innerSize * 0.8
        const endY = padding + innerSize * 0.3
        
        const checkPath = `M ${startX} ${startY} L ${midX} ${midY} L ${endX} ${endY}`
        const check = rc.path(checkPath, {
          roughness: currentRoughness * 0.6,
          bowing: 0.5,
          stroke: "#fff",
          strokeWidth: checkStroke,
          fill: "none",
          seed: baseSeed + 1,
        })
        svg.appendChild(check)
      }
    }, [isChecked, isHovered, disabled, box, stroke, checkStroke, color, roughness, drawCount])

    return (
      <button
        ref={ref}
        type="button"
        role="checkbox"
        aria-checked={isChecked}
        aria-label={ariaLabel}
        id={id}
        disabled={disabled}
        onClick={handleToggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "inline-flex items-center justify-center transition-transform",
          "hover:scale-110 active:scale-95",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#e07a5f]",
          disabled && "opacity-50 cursor-not-allowed hover:scale-100 active:scale-100",
          className
        )}
        style={{ width: box, height: box }}
      >
        <svg
          ref={svgRef}
          width={box}
          height={box}
          style={{ overflow: "visible" }}
        />
      </button>
    )
  }
)
