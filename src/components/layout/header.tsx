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
import { useDynamicThemeColors } from '@/lib/dynamic-theme-colors'
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
  onMobileMenuToggle?: () => void
}

export function Header({ className, showNavigation = true, showUserActions = true, onMobileMenuToggle }: HeaderProps) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { logoType, textLogo, logoImage } = useThemeContext()
  const themeColors = useDynamicThemeColors()
  
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
      "fixed top-0 left-0 right-0 z-40 h-14 backdrop-blur-md bg-white/20 dark:bg-white/10 border-b border-white/30 dark:border-white/20 shadow-lg",
      className
    )}>
      <div className="flex items-center justify-between px-4 h-full max-w-7xl mx-auto">
        {/* Left Side - Mobile Menu + Logo */}
        <div className="flex items-center space-x-3">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/20 dark:hover:bg-white/10 backdrop-blur-sm rounded-lg"
            onClick={onMobileMenuToggle}
          >
            <Menu className="h-4 w-4" />
          </Button>
          
          {/* Logo Section */}
          <Link href="/" className={cn("text-lg font-semibold font-logo text-gray-900 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-400", animations.transition)}>
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
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 hover:bg-white/20 dark:hover:bg-white/10 border border-white/30 dark:border-white/20 bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-lg"
              onClick={() => {
                if (theme === 'light') setTheme('dark')
                else if (theme === 'dark') setTheme('system')
                else setTheme('light')
              }}
            >
              {theme === 'light' ? (
                <Sun className="h-4 w-4 text-gray-900 dark:text-gray-100" />
              ) : theme === 'dark' ? (
                <Moon className="h-4 w-4 text-gray-900 dark:text-gray-100" />
              ) : (
                <Monitor className="h-4 w-4 text-gray-900 dark:text-gray-100" />
              )}
            </Button>
          </div>
          {/* User Actions */}
          {showUserActions && status === 'loading' ? (
            <div className="h-8 w-8 bg-white/20 dark:bg-white/10 rounded-full animate-pulse"></div>
          ) : showUserActions && session?.user ? (
            <div className="relative" ref={userDropdownRef}>
              {/* User Icon Button */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-white/20 dark:hover:bg-white/10 border border-white/30 dark:border-white/20 bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-lg"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              >
                <div className={`w-6 h-6 backdrop-blur-sm rounded-full flex items-center justify-center border ${themeColors.primary.replace('bg-', 'bg-').replace('/90', '/20')} ${themeColors.primaryBorder}`}>
                  <span className={`text-xs font-medium ${themeColors.primaryText}`}>
                    {session.user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </span>
                </div>
              </Button>
              
              {/* Dropdown Menu */}
              {isUserDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 rounded-xl shadow-lg z-50 bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/30 dark:border-white/20">
                  <div className="py-2">
                    <div className="px-4 py-2 border-b border-white/20 dark:border-white/10">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{session.user.name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{session.user.role}</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false)
                        signOut({ callbackUrl: '/' })
                      }}
                      className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:bg-white/10 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200"
                    >
                      <LogOut className="h-4 w-4" />
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
                  <Button variant="outline" size="sm" className="bg-white/20 dark:bg-white/10 backdrop-blur-sm border border-white/30 dark:border-white/20 text-gray-900 dark:text-gray-100 hover:bg-white/30 dark:hover:bg-white/20 rounded-lg">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button variant="outline" size="sm" className="bg-white/20 dark:bg-white/10 backdrop-blur-sm border border-white/30 dark:border-white/20 text-gray-900 dark:text-gray-100 hover:bg-white/30 dark:hover:bg-white/20 rounded-lg">
                    Registration
                  </Button>
                </Link>
              </div>
              
              {/* Mobile: Show dropdown */}
              <div className="md:hidden relative" ref={mobileDropdownRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 hover:bg-white/20 dark:hover:bg-white/10 border border-white/30 dark:border-white/20 bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-lg"
                  onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
                >
                  <UserCircle className="h-4 w-4 text-gray-900 dark:text-gray-100" />
                  <ChevronDown className="h-3 w-3 text-gray-900 dark:text-gray-100" />
                </Button>
                
                {/* Dropdown Menu */}
                {isMobileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 rounded-xl shadow-lg z-50 bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/30 dark:border-white/20">
                    <div className="py-1">
                      <Link 
                        href="/auth" 
                        className="block px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-white/10 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200"
                        onClick={() => setIsMobileDropdownOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link 
                        href="/auth" 
                        className="block px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-white/10 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200"
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
