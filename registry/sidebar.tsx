/**
 * ScribbleSidebar - Hand-drawn sidebar navigation
 *
 * Features:
 * - Sketchy border on the right edge
 * - Hand-drawn logo
 * - Nav items with brush-stroke active indicator
 * - User section with avatar
 */

import { Link, useLocation } from "@tanstack/react-router"
import {  createContext, useContext, useState } from "react"
import type {ReactNode} from "react";

import { ScribbleUnderline } from "./annotation/underline"
import { ScribbleAvatar } from "./avatar"
import { ScribbleDivider } from "./decorative/divider"
import { ScribbleLogo } from "./decorative/logo"
import {  ScribbleIcon } from "./icons/icon"
import type {IconName} from "./icons/icon";
import { cn } from "./lib/utils"
import { ScribbleTooltip, ScribbleTooltipContent, ScribbleTooltipTrigger } from "./tooltip"



// =============================================================================
// CONTEXT
// =============================================================================

interface SidebarContextValue {
  collapsed: boolean
}

const SidebarContext = createContext<SidebarContextValue>({ collapsed: false })

// =============================================================================
// SIDEBAR ROOT
// =============================================================================

export interface ScribbleSidebarProps {
  /** Child components */
  children: ReactNode
  /** Whether sidebar is collapsed (mobile) */
  collapsed?: boolean
  /** Additional class names */
  className?: string
}

export function ScribbleSidebar({
  children,
  collapsed = false,
  className,
}: ScribbleSidebarProps) {
  return (
    <SidebarContext.Provider value={{ collapsed }}>
      <aside
        className={cn(
          "flex h-full w-64 flex-col bg-[#fffef8] dark:bg-gray-900",
          // Right border - we'll use a CSS border for now, can add Rough.js later
          "border-r-2 border-gray-200 dark:border-gray-700",
          collapsed && "w-0 overflow-hidden",
          className
        )}
        style={{
          // Subtle paper texture feel
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
        }}
      >
        {children}
      </aside>
    </SidebarContext.Provider>
  )
}

// =============================================================================
// SIDEBAR HEADER
// =============================================================================

export interface ScribbleSidebarHeaderProps {
  /** Child components (typically logo) */
  children?: ReactNode
  /** Additional class names */
  className?: string
}

export function ScribbleSidebarHeader({
  children,
  className,
}: ScribbleSidebarHeaderProps) {
  return (
    <div
      className={cn(
        "flex h-16 items-center px-4",
        className
      )}
    >
      {children ?? (
        <Link to="/dashboard">
          <ScribbleLogo size="md" />
        </Link>
      )}
    </div>
  )
}

// =============================================================================
// SIDEBAR CONTENT
// =============================================================================

export interface ScribbleSidebarContentProps {
  /** Child components */
  children: ReactNode
  /** Additional class names */
  className?: string
}

export function ScribbleSidebarContent({
  children,
  className,
}: ScribbleSidebarContentProps) {
  return <nav className={cn("flex-1 space-y-1 p-4", className)}>{children}</nav>
}

// =============================================================================
// SIDEBAR GROUP
// =============================================================================

export interface ScribbleSidebarGroupProps {
  /** Optional group label */
  label?: string
  /** Child components */
  children: ReactNode
  /** Additional class names */
  className?: string
}

export function ScribbleSidebarGroup({
  label,
  children,
  className,
}: ScribbleSidebarGroupProps) {
  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <h3
          className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
          style={{ fontFamily: "var(--font-handwriting)" }}
        >
          {label}
        </h3>
      )}
      {children}
    </div>
  )
}

// =============================================================================
// SIDEBAR SEPARATOR
// =============================================================================

export interface ScribbleSidebarSeparatorProps {
  /** Additional class names */
  className?: string
}

export function ScribbleSidebarSeparator({
  className,
}: ScribbleSidebarSeparatorProps) {
  return (
    <div className={cn("my-4", className)}>
      <ScribbleDivider variant="line" color="muted" />
    </div>
  )
}

// =============================================================================
// SIDEBAR NAV ITEM
// =============================================================================

export interface ScribbleSidebarItemProps {
  /** Navigation destination */
  to: string
  /** Icon name */
  icon: IconName
  /** Label text */
  children: ReactNode
  /** Match exact path only */
  exact?: boolean
  /** Additional class names */
  className?: string
}

export function ScribbleSidebarItem({
  to,
  icon,
  children,
  exact = false,
  className,
}: ScribbleSidebarItemProps) {
  const location = useLocation()
  const [isHovered, setIsHovered] = useState(false)
  const isActive = exact
    ? location.pathname === to
    : location.pathname.startsWith(to)

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 px-3 py-2 text-sm transition-colors",
        isActive
          ? "text-gray-900 dark:text-gray-100"
          : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100",
        className
      )}
      style={{ fontFamily: "var(--font-handwriting)" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Icon - accent color when active or hovered */}
      <ScribbleIcon
        name={icon}
        size={20}
        color={isActive || isHovered ? "accent" : "muted"}
      />

      {/* Label with ScribbleUnderline - shows on active OR hover */}
      <ScribbleUnderline
        show={isActive || isHovered}
        color="accent"
        strokeWidth={2}
        duration={200}
      >
        {children}
      </ScribbleUnderline>
    </Link>
  )
}

// =============================================================================
// SIDEBAR FOOTER
// =============================================================================

export interface ScribbleSidebarFooterProps {
  /** Child components */
  children: ReactNode
  /** Additional class names */
  className?: string
}

export function ScribbleSidebarFooter({
  children,
  className,
}: ScribbleSidebarFooterProps) {
  return (
    <div className={cn("mt-auto", className)}>
      <div className="px-4">
        <ScribbleDivider variant="line" color="muted" />
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  )
}

// =============================================================================
// SIDEBAR USER MENU
// =============================================================================

export interface ScribbleSidebarUserProps {
  /** User display name */
  name?: string
  /** User email */
  email: string
  /** Avatar image path (e.g., "notionists/Luna") or full URL */
  image?: string | null
  /** Handler when user clicks on their profile area */
  onProfileClick?: () => void
  /** Sign out handler */
  onSignOut: () => void
  /** Additional class names */
  className?: string
}

export function ScribbleSidebarUser({
  name,
  email,
  image,
  onProfileClick,
  onSignOut,
  className,
}: ScribbleSidebarUserProps) {
  const [isProfileHovered, setIsProfileHovered] = useState(false)
  const [isLogoutHovered, setIsLogoutHovered] = useState(false)
  const displayName = name || email
  const initials = displayName.charAt(0).toUpperCase()

  // Convert image path to full URL if it's a notionist avatar
  const avatarUrl = image?.startsWith("notionists/")
    ? `/avatars/${image}.png`
    : image || undefined

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Clickable profile area */}
      <button
        type="button"
        onClick={onProfileClick}
        className="flex flex-1 items-center gap-3 min-w-0 p-1 -m-1 transition-colors"
        onMouseEnter={() => setIsProfileHovered(true)}
        onMouseLeave={() => setIsProfileHovered(false)}
      >
        <ScribbleAvatar
          src={avatarUrl}
          alt={displayName}
          fallback={initials}
          size="sm"
          borderStyle="solid"
          borderColor="accent"
        />
        <div className="flex-1 min-w-0 text-left">
          {/* Name with ScribbleUnderline on hover */}
          <p
            className="inline-block text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-full"
            style={{ fontFamily: "var(--font-handwriting)" }}
          >
            <ScribbleUnderline
              show={isProfileHovered}
              color="accent"
              strokeWidth={2}
              duration={200}
            >
              {displayName}
            </ScribbleUnderline>
          </p>
          {name && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {email}
            </p>
          )}
        </div>
      </button>
      {/* Logout button with hover effect */}
      <ScribbleTooltip>
        <ScribbleTooltipTrigger asChild>
          <button
            type="button"
            onClick={onSignOut}
            className="shrink-0 p-2 transition-colors"
            onMouseEnter={() => setIsLogoutHovered(true)}
            onMouseLeave={() => setIsLogoutHovered(false)}
          >
            <ScribbleIcon 
              name="logout" 
              size={18} 
              color={isLogoutHovered ? "accent" : "muted"} 
            />
          </button>
        </ScribbleTooltipTrigger>
        <ScribbleTooltipContent side="top">Sign out</ScribbleTooltipContent>
      </ScribbleTooltip>
    </div>
  )
}

// =============================================================================
// SIDEBAR ACTION BUTTON (for non-navigation items like Feedback/Support)
// =============================================================================

export interface ScribbleSidebarButtonProps {
  /** Icon name */
  icon: IconName
  /** Click handler */
  onClick: () => void
  /** Button content */
  children: React.ReactNode
  /** Additional class names */
  className?: string
}

export function ScribbleSidebarButton({
  icon,
  onClick,
  children,
  className,
}: ScribbleSidebarButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 px-3 py-2 text-sm transition-colors",
        "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100",
        className
      )}
      style={{ fontFamily: "var(--font-handwriting)" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Icon - accent color on hover */}
      <ScribbleIcon
        name={icon}
        size={20}
        color={isHovered ? "accent" : "muted"}
      />

      {/* Label with ScribbleUnderline on hover */}
      <ScribbleUnderline
        show={isHovered}
        color="accent"
        strokeWidth={2}
        duration={200}
      >
        {children}
      </ScribbleUnderline>
    </button>
  )
}

// =============================================================================
// HOOK
// =============================================================================

export function useSidebar() {
  return useContext(SidebarContext)
}
