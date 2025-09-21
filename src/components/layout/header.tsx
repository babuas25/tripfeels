'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  Settings, 
  BarChart3, 
  UserCheck, 
  FileText, 
  CheckSquare, 
  Briefcase, 
  TrendingUp, 
  DollarSign, 
  Map, 
  Percent, 
  User,
  LogOut,
  Menu,
  ChevronDown,
  UserCircle,
  Sun,
  Moon,
  Monitor
} from 'lucide-react'
import { NAVIGATION_ITEMS } from '@/lib/utils/constants'
import { Button } from '@/components/ui/button'
import { GlassButton } from '@/components/ui/glass-button'
import { cn } from '@/lib/utils'
import { useTheme } from '@/components/providers/theme-provider'
import { useTheme as useThemeContext } from '@/contexts/theme-context'
import { colors, animations } from '@/lib/design-tokens'

const iconMap = {
  LayoutDashboard,
  Users,
  Shield,
  Settings,
  BarChart3,
  UserCheck,
  FileText,
  CheckSquare,
  Briefcase,
  TrendingUp,
  DollarSign,
  Map,
  Percent,
  User,
}

interface HeaderProps {
  className?: string
  showNavigation?: boolean
  showUserActions?: boolean
}

export function Header({ className, showNavigation = true, showUserActions = true }: HeaderProps) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { logoType, textLogo, logoImage } = useThemeContext()
  
  // State for dropdown visibility
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false)
  const userDropdownRef = useRef<HTMLDivElement>(null)
  const mobileDropdownRef = useRef<HTMLDivElement>(null)

  const navigationItems = session?.user?.role 
    ? NAVIGATION_ITEMS[session.user.role as keyof typeof NAVIGATION_ITEMS] || []
    : []

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false)
      }
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target as Node)) {
        setIsMobileDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-40 h-14 backdrop-blur-md bg-background/80 border-b border-border shadow-sm",
      className
    )}>
      <div className="flex items-center justify-between px-4 h-full max-w-7xl mx-auto">
        {/* Left Side - Mobile Menu + Logo */}
        <div className="flex items-center space-x-3">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/60 dark:hover:bg-gray-800/60 backdrop-blur-sm"
          >
            <Menu className="h-4 w-4 text-foreground" />
          </Button>
          
          {/* Logo Section */}
          <Link href="/" className={cn("text-lg font-semibold font-logo", colors.text.primary, "hover:text-muted-foreground", animations.transition)}>
            {logoType === 'image' && logoImage ? (
              <img 
                src={logoImage} 
                alt="Logo" 
                className="h-7 w-16 object-contain"
              />
            ) : (
              textLogo
            )}
          </Link>
        </div>


        {/* Right Side Actions */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <div className="relative group">
            <GlassButton
              variant="glass"
              size="sm"
              className="h-8 px-2 hover:bg-background/90 border-border/30"
              onClick={() => {
                if (theme === 'light') setTheme('dark')
                else if (theme === 'dark') setTheme('system')
                else setTheme('light')
              }}
            >
              {theme === 'light' ? (
                <Sun className="h-4 w-4 text-foreground" />
              ) : theme === 'dark' ? (
                <Moon className="h-4 w-4 text-foreground" />
              ) : (
                <Monitor className="h-4 w-4 text-foreground" />
              )}
            </GlassButton>
          </div>
          {/* User Actions */}
          {showUserActions && status === 'loading' ? (
            <div className="h-8 w-8 bg-background/20 rounded-full animate-pulse"></div>
          ) : showUserActions && session?.user ? (
            <div className="relative" ref={userDropdownRef}>
              {/* User Icon Button */}
              <GlassButton
                variant="glass"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-background/90 border-border/30"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              >
                <div className="w-6 h-6 bg-primary/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-primary/30">
                  <span className="text-xs font-medium text-primary">
                    {session.user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </span>
                </div>
              </GlassButton>
              
              {/* Dropdown Menu */}
              {isUserDropdownOpen && (
                <div className={cn("absolute right-0 top-full mt-1 w-48 rounded-md shadow-lg z-50", colors.glass.card)}>
                  <div className="py-2">
                    <div className={cn("px-4 py-2 border-b", colors.border.muted)}>
                      <p className={cn("text-sm font-medium", colors.text.primary)}>{session.user.name}</p>
                      <p className={cn("text-xs", colors.text.secondary)}>{session.user.role}</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false)
                        signOut({ callbackUrl: '/' })
                      }}
                      className={cn("w-full text-left px-4 py-2 text-sm flex items-center gap-2", colors.text.secondary, colors.interactive.hover)}
                    >
                      <LogOut className="h-4 w-4 text-foreground" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Auth Buttons for non-authenticated users */
            <div className="flex items-center space-x-2">
              {/* Desktop: Show individual buttons */}
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/auth">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button variant="outline" size="sm">
                    Registration
                  </Button>
                </Link>
              </div>
              
              {/* Mobile: Show dropdown */}
              <div className="md:hidden relative" ref={mobileDropdownRef}>
                <GlassButton
                  variant="glass"
                  size="sm"
                  className="flex items-center gap-1 hover:bg-background/90 border-border/30"
                  onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
                >
                  <UserCircle className="h-4 w-4 text-foreground" />
                  <ChevronDown className="h-3 w-3 text-foreground" />
                </GlassButton>
                
                {/* Dropdown Menu */}
                {isMobileDropdownOpen && (
                  <div className={cn("absolute right-0 top-full mt-1 w-48 rounded-md shadow-lg z-50", colors.glass.card)}>
                    <div className="py-1">
                      <Link 
                        href="/auth" 
                        className={cn("block px-4 py-2 text-sm", colors.text.secondary, colors.interactive.hover)}
                        onClick={() => setIsMobileDropdownOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link 
                        href="/auth" 
                        className={cn("block px-4 py-2 text-sm", colors.text.secondary, colors.interactive.hover)}
                        onClick={() => setIsMobileDropdownOpen(false)}
                      >
                        Registration
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
