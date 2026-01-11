/**
 * ScribbleAvatarPicker - Grid of avatars to select from
 *
 * Uses the notionists avatar set from public/avatars/notionists/
 * Features:
 * - Grid layout of avatar options
 * - Selected state with sketchy border
 * - Optional sketchy border around entire picker
 * - Keyboard navigation
 */

import { useCallback, useEffect, useRef } from "react"
import rough from "roughjs"

import { cn } from "./lib/utils"

// Available notionist avatars
const NOTIONIST_AVATARS = [
  "Maria",
  "Sophie",
  "Felix",
  "Luna",
  "Oliver",
  "Emma",
  "Liam",
  "Ava",
  "Noah",
  "Isabella",
  "Mia",
  "Lucas",
  "Charlotte",
  "Ethan",
  "Amelia",
  "James",
  "Harper",
  "Benjamin",
  "Evelyn",
  "Henry",
  "Aria",
  "Alexander",
] as const

export type NotionistAvatar = (typeof NOTIONIST_AVATARS)[number]

export function getAvatarUrl(avatar: NotionistAvatar): string {
  return `/avatars/notionists/${avatar}.png`
}

export function getRandomAvatar(): NotionistAvatar {
  const index = Math.floor(Math.random() * NOTIONIST_AVATARS.length)
  return NOTIONIST_AVATARS[index]
}

export interface ScribbleAvatarPickerProps {
  /** Currently selected avatar */
  value?: NotionistAvatar
  /** Called when an avatar is selected */
  onChange?: (avatar: NotionistAvatar) => void
  /** Size of each avatar option */
  size?: number
  /** Number of columns in grid */
  columns?: number
  /** Show sketchy border around the picker */
  bordered?: boolean
  /** Max height with scroll (e.g., "12rem", "200px") */
  maxHeight?: string
  /** Additional class names */
  className?: string
}

export function ScribbleAvatarPicker({
  value,
  onChange,
  size = 56,
  columns = 6,
  bordered = false,
  maxHeight,
  className,
}: ScribbleAvatarPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  // Draw sketchy border around container
  const drawBorder = useCallback(() => {
    if (!bordered || !containerRef.current || !svgRef.current) return

    const svg = svgRef.current
    const container = containerRef.current
    while (svg.firstChild) svg.removeChild(svg.firstChild)

    const width = container.offsetWidth
    const height = container.offsetHeight

    if (width === 0 || height === 0) return

    // Set SVG dimensions
    svg.setAttribute("width", String(width + 4))
    svg.setAttribute("height", String(height + 4))

    const rc = rough.svg(svg)
    const styles = getComputedStyle(document.documentElement)
    const strokeColor =
      styles.getPropertyValue("--scribble-stroke-muted").trim() || "#a3a3a3"

    const border = rc.rectangle(2, 2, width, height, {
      roughness: 1.2,
      stroke: strokeColor,
      strokeWidth: 1.5,
      seed: 99,
    })
    svg.appendChild(border)
  }, [bordered])

  // Draw border on mount and when bordered changes
  useEffect(() => {
    if (!bordered) return

    // Use requestAnimationFrame to ensure layout is complete
    requestAnimationFrame(() => {
      drawBorder()
    })

    // ResizeObserver for dynamic sizing
    const container = containerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver(() => {
      drawBorder()
    })
    resizeObserver.observe(container)

    return () => resizeObserver.disconnect()
  }, [bordered, drawBorder])

  if (bordered) {
    return (
      <div className="relative">
        {/* Sketchy border SVG */}
        <svg
          ref={svgRef}
          className="pointer-events-none absolute -inset-0.5"
          style={{ overflow: "visible" }}
          aria-hidden="true"
        />
        {/* Container with content */}
        <div
          ref={containerRef}
          className={cn("overflow-y-auto p-2", className)}
          style={{ maxHeight }}
        >
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
            role="radiogroup"
            aria-label="Select an avatar"
          >
            {NOTIONIST_AVATARS.map((avatar, index) => (
              <AvatarOption
                key={avatar}
                avatar={avatar}
                isSelected={value === avatar}
                size={size}
                seed={42 + index}
                onClick={() => onChange?.(avatar)}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn("grid gap-2", className)}
      style={{ 
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        maxHeight,
      }}
      role="radiogroup"
      aria-label="Select an avatar"
    >
      {NOTIONIST_AVATARS.map((avatar, index) => (
        <AvatarOption
          key={avatar}
          avatar={avatar}
          isSelected={value === avatar}
          size={size}
          seed={42 + index}
          onClick={() => onChange?.(avatar)}
        />
      ))}
    </div>
  )
}

interface AvatarOptionProps {
  avatar: NotionistAvatar
  isSelected: boolean
  size: number
  seed: number
  onClick: () => void
}

function AvatarOption({
  avatar,
  isSelected,
  size,
  seed,
  onClick,
}: AvatarOptionProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  // Draw sketchy selection border when selected
  useEffect(() => {
    if (!svgRef.current) return

    const svg = svgRef.current
    while (svg.firstChild) svg.removeChild(svg.firstChild)

    if (!isSelected) return

    const rc = rough.svg(svg)
    const styles = getComputedStyle(document.documentElement)
    const accentColor =
      styles.getPropertyValue("--scribble-stroke-accent").trim() || "#e07a5f"

    const border = rc.rectangle(2, 2, size - 4, size - 4, {
      roughness: 1.5,
      stroke: accentColor,
      strokeWidth: 2.5,
      seed,
    })
    svg.appendChild(border)
  }, [isSelected, size, seed])

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      aria-label={avatar}
      onClick={onClick}
      className={cn(
        "relative rounded-lg p-1 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
        "hover:scale-105 active:scale-95",
        isSelected && "bg-amber-50 dark:bg-gray-800"
      )}
      style={{
        width: size,
        height: size,
        // Slight random rotation for hand-drawn feel
        transform: `rotate(${((seed % 5) - 2) * 0.8}deg)`,
      }}
    >
      {/* Selection border SVG */}
      <svg
        ref={svgRef}
        className="pointer-events-none absolute inset-0"
        width={size}
        height={size}
        style={{ overflow: "visible" }}
      />

      {/* Avatar image */}
      <img
        src={getAvatarUrl(avatar)}
        alt={avatar}
        className="h-full w-full rounded-lg object-cover"
        draggable={false}
      />
    </button>
  )
}

export { NOTIONIST_AVATARS }
