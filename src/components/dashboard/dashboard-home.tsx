'use client'

import { useSession } from 'next-auth/react'
import { StatsCard } from '@/components/dashboard/stats-card'
import { DynamicButton } from '@/components/ui/dynamic-theme-components'
import { Users, TrendingUp, Activity, Star } from 'lucide-react'

interface DashboardHomeProps {
  userRole?: string
}

export function DashboardHome({ userRole }: DashboardHomeProps) {
  const { data: session } = useSession()
  const role = userRole || session?.user?.role

  const getWelcomeMessage = () => {
    const firstName = session?.user?.name?.split(' ')[0] || 'User'
    return `Welcome back, ${firstName}!`
  }

  const getRoleSpecificContent = () => {
    switch (role) {
      case 'SuperAdmin':
        return {
          title: 'Super Admin Dashboard',
          description: 'Manage the entire platform, themes, and user administration.',
          stats: [
            { title: 'Total Users', value: '1,234', icon: Users, trend: { value: 12, isPositive: true } },
            { title: 'Active Themes', value: '5', icon: Star, trend: { value: 1, isPositive: true } },
            { title: 'System Health', value: '99.9%', icon: Activity, trend: { value: 0.1, isPositive: true } },
            { title: 'Active Sessions', value: '89', icon: TrendingUp, trend: { value: 5, isPositive: true } }
          ]
        }
      case 'Admin':
        return {
          title: 'Admin Dashboard',
          description: 'Manage users, monitor system performance, and oversee operations.',
          stats: [
            { title: 'Total Users', value: '856', icon: Users, trend: { value: 8, isPositive: true } },
            { title: 'Active Staff', value: '24', icon: Users, trend: { value: 2, isPositive: true } },
            { title: 'Partners', value: '12', icon: Star, trend: { value: 1, isPositive: true } },
            { title: 'Agents', value: '45', icon: TrendingUp, trend: { value: 3, isPositive: true } }
          ]
        }
      case 'Staff':
        return {
          title: 'Staff Dashboard',
          description: 'Manage daily operations, customer support, and content.',
          stats: [
            { title: 'Open Tickets', value: '12', icon: Activity, trend: { value: -3, isPositive: true } },
            { title: 'Resolved Today', value: '28', icon: TrendingUp, trend: { value: 5, isPositive: true } },
            { title: 'Active Projects', value: '7', icon: Star, trend: { value: 1, isPositive: true } },
            { title: 'Team Members', value: '24', icon: Users, trend: { value: 0, isPositive: true } }
          ]
        }
      case 'Partner':
        return {
          title: 'Partner Dashboard',
          description: 'Manage your business partnerships and service offerings.',
          stats: [
            { title: 'Active Services', value: '15', icon: Star, trend: { value: 2, isPositive: true } },
            { title: 'Monthly Revenue', value: '$12,450', icon: TrendingUp, trend: { value: 15, isPositive: true } },
            { title: 'Partner Rating', value: '4.8/5', icon: Star, trend: { value: 0.2, isPositive: true } },
            { title: 'Active Bookings', value: '89', icon: Activity, trend: { value: 12, isPositive: true } }
          ]
        }
      case 'Agent':
        return {
          title: 'Agent Dashboard',
          description: 'Manage bookings, customer relationships, and sales.',
          stats: [
            { title: 'Total Bookings', value: '156', icon: TrendingUp, trend: { value: 23, isPositive: true } },
            { title: 'Monthly Sales', value: '$8,920', icon: TrendingUp, trend: { value: 18, isPositive: true } },
            { title: 'Customer Rating', value: '4.7/5', icon: Star, trend: { value: 0.1, isPositive: true } },
            { title: 'Active Leads', value: '34', icon: Users, trend: { value: 7, isPositive: true } }
          ]
        }
      case 'User':
      default:
        return {
          title: 'Travel Dashboard',
          description: 'Manage your travel plans, bookings, and preferences.',
          stats: [
            { title: 'Upcoming Trips', value: '3', icon: Star, trend: { value: 1, isPositive: true } },
            { title: 'Total Bookings', value: '12', icon: TrendingUp, trend: { value: 2, isPositive: true } },
            { title: 'Loyalty Points', value: '2,450', icon: Star, trend: { value: 150, isPositive: true } },
            { title: 'Saved Places', value: '24', icon: Activity, trend: { value: 3, isPositive: true } }
          ]
        }
    }
  }

  const content = getRoleSpecificContent()

  return (
    <div className="space-y-6">
      {/* Welcome Section with Glassmorphism */}
      <div className="p-6 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-xl border border-white/30 dark:border-white/20 shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {getWelcomeMessage()}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {content.description}
        </p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {content.stats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {role === 'SuperAdmin' && (
          <>
            <div className="p-6 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-xl border border-white/30 dark:border-white/20 shadow-lg hover:bg-white/25 dark:hover:bg-white/15 transition-all duration-300">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">User Management</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Manage users, roles, and permissions across the platform.
              </p>
              <DynamicButton variant="primary" asChild>
                <a href="/superadmin/admin/user-management">
                  Manage Users
                </a>
              </DynamicButton>
            </div>
            
            <div className="p-6 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-xl border border-white/30 dark:border-white/20 shadow-lg hover:bg-white/25 dark:hover:bg-white/15 transition-all duration-300">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Theme Management</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Customize platform themes and visual settings.
              </p>
              <DynamicButton variant="secondary" asChild>
                <a href="/superadmin/theme">
                  Manage Themes
                </a>
              </DynamicButton>
            </div>
          </>
        )}

        {role === 'Admin' && (
          <div className="p-6 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-xl border border-white/30 dark:border-white/20 shadow-lg hover:bg-white/25 dark:hover:bg-white/15 transition-all duration-300">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">User Management</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              View and manage users, their roles and categories.
            </p>
            <DynamicButton variant="primary" asChild>
              <a href="/users/admin/user-management">
                Manage Users
              </a>
            </DynamicButton>
          </div>
        )}

        <div className="p-6 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-xl border border-white/30 dark:border-white/20 shadow-lg hover:bg-white/25 dark:hover:bg-white/15 transition-all duration-300">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Profile Settings</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Update your profile information and preferences.
          </p>
          <DynamicButton variant="outline" asChild>
            <a href="/profile">
              Edit Profile
            </a>
          </DynamicButton>
        </div>

        <div className="p-6 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-xl border border-white/30 dark:border-white/20 shadow-lg hover:bg-white/25 dark:hover:bg-white/15 transition-all duration-300">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Support</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Get help and support for your account and platform usage.
          </p>
          <DynamicButton variant="ghost" asChild>
            <a href="/support">
              Contact Support
            </a>
          </DynamicButton>
        </div>
      </div>
    </div>
  )
}
