'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { type UserDocument, type RoleType } from '@/lib/firebase/firestore'
import { ROLES } from '@/lib/utils/constants'

export default function AdminUserManagement() {
  const { data: session, status } = useSession()
  const currentUserRole = session?.user?.role as RoleType | undefined

  const [users, setUsers] = useState<UserDocument[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const [roleFilter, setRoleFilter] = useState<RoleType | 'All'>('All')
  const [search, setSearch] = useState<string>('')

  const roleOptions: RoleType[] = useMemo(() => [
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.STAFF,
    ROLES.PARTNER,
    ROLES.AGENT,
    ROLES.USER,
  ], [])

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        const res = await fetch('/api/admin/users')
        if (!res.ok) throw new Error('fetch')
        const json = await res.json()
        setUsers(json.users as UserDocument[])
      } catch (e) {
        setError('Failed to load users')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const filteredUsers = useMemo(() => {
    return users
      .filter(u => roleFilter === 'All' ? true : u.role === roleFilter)
      .filter(u => {
        const q = search.trim().toLowerCase()
        if (!q) return true
        const name = `${u.profile?.firstName ?? ''} ${u.profile?.lastName ?? ''}`.toLowerCase()
        return (
          u.email.toLowerCase().includes(q) ||
          name.includes(q) ||
          (u.category?.toLowerCase() ?? '').includes(q)
        )
      })
  }, [users, roleFilter, search])

  const isSessionLoading = status === 'loading'
  const canManage = !isSessionLoading && (currentUserRole === ROLES.SUPER_ADMIN || currentUserRole === ROLES.ADMIN)

  const handleRoleChange = async (targetUser: UserDocument, newRole: RoleType) => {
    if (!canManage) return
    if (!session?.user?.email) return

    // Admin cannot change SuperAdmin in any way
    if (currentUserRole === ROLES.ADMIN && targetUser.role === ROLES.SUPER_ADMIN) {
      setError("Admins cannot change SuperAdmin's role")
      return
    }

    // Additionally, prevent Admin from setting anyone to SuperAdmin
    if (currentUserRole === ROLES.ADMIN && newRole === ROLES.SUPER_ADMIN) {
      setError('Admins cannot assign SuperAdmin role')
      return
    }

    try {
      setError(null)
      await fetch(`/api/admin/users/${targetUser.uid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })
      setUsers(prev => prev.map(u => u.uid === targetUser.uid ? { ...u, role: newRole } : u))
    } catch (e) {
      setError('Failed to update role')
    }
  }

  const handleCategoryChange = async (targetUser: UserDocument, newCategory: string) => {
    if (!canManage) return
    // Admin cannot update SuperAdmin's category
    if (currentUserRole === ROLES.ADMIN && targetUser.role === ROLES.SUPER_ADMIN) {
      setError("Admins cannot change SuperAdmin's category")
      return
    }
    try {
      setError(null)
      await fetch(`/api/admin/users/${targetUser.uid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: newCategory })
      })
      setUsers(prev => prev.map(u => u.uid === targetUser.uid ? { ...u, category: newCategory } : u))
    } catch (e) {
      setError('Failed to update category')
    }
  }

  if (isSessionLoading) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">Checking permissions…</div>
      </div>
    )
  }

  if (!canManage) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold text-foreground">Access Denied</h1>
        <p className="text-sm text-muted-foreground">Only SuperAdmin and Admin can manage users.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-xl border border-white/30 dark:border-white/20 shadow-lg">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">User Management</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">View all users, their roles and categories. Update as needed.</p>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search by name, email, or category"
              className="h-9 w-64 rounded-lg border border-white/30 bg-white/20 backdrop-blur-sm px-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="h-9 rounded-lg border border-white/30 bg-white/20 backdrop-blur-sm px-3 text-sm text-gray-900 dark:text-gray-100"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as RoleType | 'All')}
            >
              <option value="All">All Roles</option>
              {roleOptions.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded-xl">
          <p className="text-sm text-red-600 dark:text-red-200">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="p-6 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-xl border border-white/30 dark:border-white/20 shadow-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">Loading users...</div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/30 bg-white/20 backdrop-blur-md shadow-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-white/20 backdrop-blur-sm">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-900 dark:text-gray-100">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-900 dark:text-gray-100">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-900 dark:text-gray-100">Role</th>
                <th className="text-left px-4 py-3 font-medium text-gray-900 dark:text-gray-100">Category</th>
                <th className="text-left px-4 py-3 font-medium text-gray-900 dark:text-gray-100">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, idx) => {
                const fullName = `${user.profile?.firstName ?? ''} ${user.profile?.lastName ?? ''}`.trim()
                const isSuperAdmin = user.role === ROLES.SUPER_ADMIN
                const disableAdminActions = currentUserRole === ROLES.ADMIN && isSuperAdmin
                return (
                  <tr key={user.uid ?? `${user.email}-${idx}`} className="border-t border-white/30 hover:bg-white/10 transition-colors">
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{fullName || '—'}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{user.email}</td>
                    <td className="px-4 py-3">
                      <select
                        className="h-8 rounded-lg border border-white/30 bg-white/20 backdrop-blur-sm px-2 text-gray-900 dark:text-gray-100"
                        value={user.role}
                        onChange={(e) => handleRoleChange(user, e.target.value as RoleType)}
                        disabled={disableAdminActions}
                      >
                        {roleOptions.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        className="h-8 w-40 rounded-lg border border-white/30 bg-white/20 backdrop-blur-sm px-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                        value={user.category ?? ''}
                        onChange={(e) => handleCategoryChange(user, e.target.value)}
                        disabled={disableAdminActions}
                        placeholder="e.g., Premium, VIP"
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {user.metadata?.isActive ? 'Active' : 'Inactive'}
                    </td>
                  </tr>
                )
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-600 dark:text-gray-400">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
