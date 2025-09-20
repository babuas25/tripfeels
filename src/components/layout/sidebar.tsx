'use client'

import { useState } from 'react'
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
  Home,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Palette
} from 'lucide-react'
import { NAVIGATION_ITEMS } from '@/lib/utils/constants'
import { Button } from '@/components/ui/button'
import { GlassButton } from '@/components/ui/glass-button'
import { cn } from '@/lib/utils'
import { colors, animations } from '@/lib/design-tokens'
import { useTheme } from '@/contexts/theme-context'

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
  Home,
  Palette,
}

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const { data: session } = useSession()
  const pathname = usePathname()
  const { logoType, textLogo, logoImage } = useTheme()

  // Always show sidebar with fallback navigation
  const navigationItems = session?.user?.role 
    ? NAVIGATION_ITEMS[session.user.role as keyof typeof NAVIGATION_ITEMS] || []
    : [{ label: 'Home', href: '/', icon: 'Home' }]

  return (
    <div className={cn(
      "flex flex-col backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-r border-white/20 dark:border-gray-800/20 shadow-md transition-all duration-300 h-full",
      isCollapsed ? "w-20" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        {!isCollapsed && (
          <h2 className={cn("text-xl font-bold font-logo", colors.text.primary)}>
            {logoType === 'image' && logoImage ? (
              <img 
                src={logoImage} 
                alt="Logo" 
                className="h-7 w-16 object-contain"
              />
            ) : (
              textLogo
            )}
          </h2>
        )}
        <div className="flex justify-center w-full">
          <GlassButton
            variant="glass"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 font-bold"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4 font-bold" /> : <ChevronLeft className="h-4 w-4 font-bold" />}
          </GlassButton>
        </div>
      </div>
      
      {/* Divider */}
      <div className={cn("border-b", colors.border.muted)}></div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6">
        {navigationItems.map((item) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap]
          const isActive = pathname === item.href

          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 backdrop-blur-sm",
                isActive 
                  ? cn("bg-muted/80", colors.text.primary)
                  : cn(colors.text.secondary, colors.interactive.hover)
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Divider */}
      <div className={cn("border-b", colors.border.muted)}></div>

      {/* User Profile & Sign Out */}
      <div className="p-4">
        {!isCollapsed && session?.user && (
          <div className="mb-3">
            <p className={cn("text-sm font-medium", colors.text.primary)}>{session.user.name}</p>
            <p className={cn("text-xs", colors.text.secondary)}>{session.user.role}</p>
          </div>
        )}
        <GlassButton
          variant="glass"
          size={isCollapsed ? "icon" : "sm"}
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full justify-start px-3 py-2"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span className="ml-3">Sign Out</span>}
        </GlassButton>
      </div>
    </div>
  )
}
