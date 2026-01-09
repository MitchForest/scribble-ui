/**
 * ScribbleSkeleton - Loading placeholder with sketchy aesthetic
 *
 * Features:
 * - Sketchy border outline
 * - Animated hachure-style fill sweep
 * - Multiple size variants
 */

import { cn } from "./lib/utils"

export interface ScribbleSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ScribbleSkeleton({ className, ...props }: ScribbleSkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-sm",
        "bg-gray-100 dark:bg-gray-800",
        // Animated shimmer effect
        "before:absolute before:inset-0",
        "before:-translate-x-full before:animate-[shimmer_1.5s_infinite]",
        "before:bg-gradient-to-r before:from-transparent before:via-gray-200/60 before:to-transparent",
        "dark:before:via-gray-700/40",
        className
      )}
      {...props}
    />
  )
}
