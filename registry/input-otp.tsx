/**
 * ScribbleInputOTP - 6-digit OTP input with hand-drawn Rough.js styling
 * 
 * Features:
 * - Wrapper around input-otp library for accessibility
 * - Each digit slot has a sketchy hand-drawn border
 * - Focus state with accent color highlight
 * - Handwriting font for entered digits
 * - Slight rotation per slot for organic feel
 */

import { OTPInput  } from "input-otp"
import type {SlotProps} from "input-otp";
import { useEffect, useRef, useState } from "react"
import rough from "roughjs"

import { cn } from "./lib/utils"

// =============================================================================
// TYPES
// =============================================================================

export interface ScribbleInputOTPProps {
  /** Maximum number of digits */
  maxLength?: number
  /** Current value */
  value?: string
  /** Change handler */
  onChange?: (value: string) => void
  /** Disabled state */
  disabled?: boolean
  /** Auto focus on mount */
  autoFocus?: boolean
  /** Additional class names */
  className?: string
  /** Container class names */
  containerClassName?: string
  /** Roughness level */
  roughness?: number
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ScribbleInputOTP({
  maxLength = 6,
  value,
  onChange,
  disabled,
  autoFocus,
  className,
  containerClassName,
  roughness = 1.5,
}: ScribbleInputOTPProps) {
  return (
    <OTPInput
      maxLength={maxLength}
      value={value}
      onChange={onChange}
      disabled={disabled}
      autoFocus={autoFocus}
      containerClassName={cn(
        "flex items-center gap-2",
        disabled && "opacity-50 cursor-not-allowed",
        containerClassName
      )}
      className={cn("disabled:cursor-not-allowed", className)}
      spellCheck={false}
      render={({ slots }) => (
        <div className="flex items-center gap-2">
          {slots.map((slot, index) => (
            <ScribbleInputOTPSlot 
              key={index} 
              index={index}
              slot={slot}
              roughness={roughness} 
            />
          ))}
        </div>
      )}
    />
  )
}

// =============================================================================
// SLOT COMPONENT
// =============================================================================

interface ScribbleInputOTPSlotInternalProps {
  index: number
  slot: SlotProps
  roughness?: number
  className?: string
}

function ScribbleInputOTPSlot({ 
  index, 
  slot,
  roughness = 1.5,
  className,
}: ScribbleInputOTPSlotInternalProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  
  // Get slot state directly from props (not context)
  const { char, hasFakeCaret, isActive } = slot
  
  const [drawSeed, setDrawSeed] = useState(index * 10 + 42)
  
  // Slight random rotation for organic feel (-2 to 2 degrees)
  const rotation = ((index * 7 + 3) % 5) - 2
  
  // Size of each slot
  const size = 48

  // Redraw with different seed on focus for animation effect
  useEffect(() => {
    if (isActive) {
      setDrawSeed(prev => prev + 1)
    }
  }, [isActive])

  // Draw rough border
  useEffect(() => {
    if (!svgRef.current) return

    const svg = svgRef.current
    while (svg.firstChild) svg.removeChild(svg.firstChild)

    const rc = rough.svg(svg)
    
    // Get colors from CSS variables
    const styles = getComputedStyle(document.documentElement)
    const accentColor = styles.getPropertyValue("--scribble-stroke-accent").trim() || "#e07a5f"
    const mutedColor = styles.getPropertyValue("--scribble-stroke-muted").trim() || "#6b7280"
    const strokeColor = styles.getPropertyValue("--scribble-stroke").trim() || "#1a1a1a"
    const bgColor = styles.getPropertyValue("--scribble-bg-card").trim() || "#ffffff"
    
    const borderColor = isActive ? accentColor : char ? strokeColor : mutedColor
    const strokeWidth = isActive ? 2.5 : 2

    const rect = rc.rectangle(3, 3, size - 6, size - 6, {
      roughness: isActive ? roughness * 1.2 : roughness,
      bowing: 1.5,
      stroke: borderColor,
      strokeWidth,
      fill: bgColor,
      fillStyle: "solid",
      seed: drawSeed,
    })
    svg.appendChild(rect)
  }, [isActive, char, roughness, drawSeed])

  return (
    <div
      data-slot="scribble-otp-slot"
      data-active={isActive}
      data-char={char || ""}
      className={cn(
        "relative flex items-center justify-center",
        "transition-transform duration-150",
        isActive && "scale-105",
        className
      )}
      style={{
        width: size,
        height: size,
        transform: `rotate(${rotation}deg)`,
      }}
    >
      {/* SVG border - z-0 (behind) */}
      <svg
        ref={svgRef}
        className="pointer-events-none absolute inset-0"
        width={size}
        height={size}
        style={{ overflow: "visible", zIndex: 0 }}
      />
      
      {/* Character display - z-10 (in front of SVG) */}
      <span
        className="absolute inset-0 flex items-center justify-center font-handwriting text-2xl text-gray-800 select-none"
        style={{ zIndex: 10 }}
      >
        {char}
      </span>
      
      {/* Blinking caret - z-20 (in front of everything) */}
      {hasFakeCaret && (
        <div 
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{ zIndex: 20 }}
        >
          <div 
            className="animate-pulse bg-gray-800" 
            style={{ width: 2, height: 24 }}
          />
        </div>
      )}
    </div>
  )
}

// =============================================================================
// GROUP COMPONENT (optional, for custom layouts)
// =============================================================================

export interface ScribbleInputOTPGroupProps {
  children: React.ReactNode
  className?: string
}

export function ScribbleInputOTPGroup({ children, className }: ScribbleInputOTPGroupProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {children}
    </div>
  )
}

// =============================================================================
// SEPARATOR COMPONENT (optional, for custom layouts)
// =============================================================================

export interface ScribbleInputOTPSeparatorProps {
  className?: string
}

export function ScribbleInputOTPSeparator({ className }: ScribbleInputOTPSeparatorProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  
  useEffect(() => {
    if (!svgRef.current) return
    
    const svg = svgRef.current
    while (svg.firstChild) svg.removeChild(svg.firstChild)
    
    const rc = rough.svg(svg)
    const styles = getComputedStyle(document.documentElement)
    const mutedColor = styles.getPropertyValue("--scribble-stroke-muted").trim() || "#6b7280"
    
    // Draw a short sketchy dash
    const line = rc.line(4, 12, 16, 12, {
      roughness: 1.5,
      stroke: mutedColor,
      strokeWidth: 2,
      seed: 99,
    })
    svg.appendChild(line)
  }, [])
  
  return (
    <div className={cn("flex items-center justify-center", className)} style={{ width: 20, height: 24 }}>
      <svg
        ref={svgRef}
        width={20}
        height={24}
        style={{ overflow: "visible" }}
      />
    </div>
  )
}
