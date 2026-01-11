/**
 * ScribblePageFooter - Simplified footer for non-landing pages
 * 
 * Features:
 * - Copyright text in handwriting font
 * - Simple links with ScribbleLink
 * - Optional divider above
 * - Clean, minimal design
 */

import { ScribbleDivider } from "./decorative/divider"
import { cn } from "./lib/utils"
import { ScribbleLink } from "./link"

export interface ScribblePageFooterProps {
  /** Show divider above footer */
  showDivider?: boolean
  /** Additional class names */
  className?: string
}

export function ScribblePageFooter({
  showDivider = false,
  className,
}: ScribblePageFooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={cn("bg-[#fffef8]", className)}>
      {showDivider && (
        <div className="container px-4">
          <ScribbleDivider variant="dashed" color="#d1d5db" className="my-0" />
        </div>
      )}
      
      <div className="container py-6 px-4">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-gray-500 font-handwriting">
            © {currentYear} Scribble. All rights reserved.
          </p>
          
          <nav className="flex gap-6">
            <ScribbleLink href="#" color="muted" underlineColor="accent" className="text-sm">
              Privacy
            </ScribbleLink>
            <ScribbleLink href="#" color="muted" underlineColor="accent" className="text-sm">
              Terms
            </ScribbleLink>
            <ScribbleLink href="#" color="muted" underlineColor="accent" className="text-sm">
              Contact
            </ScribbleLink>
          </nav>
        </div>
      </div>
    </footer>
  )
}
