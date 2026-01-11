/**
 * ScribblePageHeader - Simplified header for non-landing pages
 * 
 * Features:
 * - Scribble logo (link to home)
 * - Optional navigation items
 * - Clean cream background (matches body)
 * - Mobile responsive
 */

import { Link } from "@tanstack/react-router"

import { ScribbleButton } from "./button"
import { ScribbleLogo } from "./decorative/logo"
import { cn } from "./lib/utils"

export interface ScribblePageHeaderProps {
  /** Show sign in button */
  showSignIn?: boolean
  /** Show join waitlist button */
  showWaitlist?: boolean
  /** Additional class names */
  className?: string
}

export function ScribblePageHeader({
  showSignIn = false,
  showWaitlist = false,
  className,
}: ScribblePageHeaderProps) {
  return (
    <header className={cn("bg-[#fffef8]", className)}>
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <ScribbleLogo />
        </Link>

        <nav className="flex items-center gap-4">
          {showSignIn && (
            <ScribbleButton asChild variant="primary" size="sm">
              <Link to="/login">Sign In</Link>
            </ScribbleButton>
          )}
          {showWaitlist && (
            <ScribbleButton asChild variant="primary" size="sm">
              <Link to="/waitlist">Join Waitlist</Link>
            </ScribbleButton>
          )}
        </nav>
      </div>
    </header>
  )
}
