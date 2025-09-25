import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function StatsCard({ title, value, description, icon: Icon, trend }: StatsCardProps) {
  return (
    <div className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-xl border border-white/30 dark:border-white/20 shadow-lg p-6 hover:bg-white/25 dark:hover:bg-white/15 transition-all duration-300">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h3>
        <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
        {description && (
          <p className="text-xs text-gray-600 dark:text-gray-400">{description}</p>
        )}
        {trend && (
          <div className="flex items-center pt-1">
            <span className={`text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">from last month</span>
          </div>
        )}
      </div>
    </div>
  )
}
