/**
 * ScribbleRating - Hand-drawn star rating component
 *
 * Features:
 * - 1-5 star rating
 * - Hover preview
 * - Keyboard navigation
 * - Hand-drawn stars using Rough.js
 */

import { useCallback, useState } from "react"

import { ScribbleIcon } from "./icons/icon"
import { cn } from "./lib/utils"

export interface ScribbleRatingProps {
  /** Current rating value (1-5, or 0/undefined for no selection) */
  value?: number
  /** Called when rating changes */
  onChange?: (value: number) => void
  /** Number of stars to show */
  max?: number
  /** Size of each star */
  size?: number
  /** Whether the rating is read-only */
  readOnly?: boolean
  /** Whether the rating is disabled */
  disabled?: boolean
  /** Additional class names */
  className?: string
}

export function ScribbleRating({
  value = 0,
  onChange,
  max = 5,
  size = 24,
  readOnly = false,
  disabled = false,
  className,
}: ScribbleRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null)

  const handleClick = useCallback(
    (starValue: number) => {
      if (readOnly || disabled) return
      onChange?.(starValue)
    },
    [readOnly, disabled, onChange]
  )

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, starValue: number) => {
      if (readOnly || disabled) return

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault()
        onChange?.(starValue)
      } else if (event.key === "ArrowRight" || event.key === "ArrowUp") {
        event.preventDefault()
        const newValue = Math.min(max, (value || 0) + 1)
        onChange?.(newValue)
      } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
        event.preventDefault()
        const newValue = Math.max(1, (value || 0) - 1)
        onChange?.(newValue)
      }
    },
    [readOnly, disabled, onChange, value, max]
  )

  const displayValue = hoverValue ?? value

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      role="radiogroup"
      aria-label="Rating"
      onMouseLeave={() => setHoverValue(null)}
    >
      {Array.from({ length: max }, (_, index) => {
        const starValue = index + 1
        const isFilled = displayValue >= starValue
        const isInteractive = !readOnly && !disabled

        return (
          <button
            key={starValue}
            type="button"
            role="radio"
            aria-checked={value === starValue}
            aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
            tabIndex={isInteractive ? 0 : -1}
            disabled={disabled}
            onClick={() => handleClick(starValue)}
            onKeyDown={(e) => handleKeyDown(e, starValue)}
            onMouseEnter={() => isInteractive && setHoverValue(starValue)}
            className={cn(
              "relative p-0.5 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded",
              isInteractive && "cursor-pointer hover:scale-110",
              !isInteractive && "cursor-default"
            )}
            style={{
              // Slight random rotation for hand-drawn feel
              transform: `rotate(${(index % 3 - 1) * 2}deg)`,
            }}
          >
            <ScribbleIcon
              name={isFilled ? "star-filled" : "star"}
              size={size}
              color={isFilled ? "accent" : "muted"}
              seed={42 + index}
            />
          </button>
        )
      })}
    </div>
  )
}
