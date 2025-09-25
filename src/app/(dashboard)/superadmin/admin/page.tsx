'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { type UserDocument, type RoleType } from '@/lib/firebase/firestore'
import { ROLES } from '@/lib/utils/constants'

export default function SuperAdminDashboard() {
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

    if (currentUserRole === ROLES.ADMIN && targetUser.role === ROLES.SUPER_ADMIN) {
      setError("Admins cannot change SuperAdmin's role")
      return
    }

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
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground">View all users, their roles and categories. Update as needed.</p>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by name, email, or category"
            className="h-9 w-64 rounded-md border border-input bg-background px-3 text-sm text-foreground"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
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

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md dark:bg-red-500/20 dark:border-red-500/30">
          <p className="text-sm text-red-600 dark:text-red-200">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading users...</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-background/40 backdrop-blur-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-foreground">Name</th>
                <th className="text-left px-4 py-2 font-medium text-foreground">Email</th>
                <th className="text-left px-4 py-2 font-medium text-foreground">Role</th>
                <th className="text-left px-4 py-2 font-medium text-foreground">Category</th>
                <th className="text-left px-4 py-2 font-medium text-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, idx) => {
                const fullName = `${user.profile?.firstName ?? ''} ${user.profile?.lastName ?? ''}`.trim()
                const isSuperAdmin = user.role === ROLES.SUPER_ADMIN
                const disableAdminActions = currentUserRole === ROLES.ADMIN && isSuperAdmin
                return (
                  <tr key={user.uid ?? `${user.email}-${idx}`} className="border-t border-border/60">
                    <td className="px-4 py-2 text-foreground">{fullName || '—'}</td>
                    <td className="px-4 py-2 text-foreground">{user.email}</td>
                    <td className="px-4 py-2">
                      <select
                        className="h-8 rounded-md border border-input bg-background px-2 text-foreground"
                        value={user.role}
                        onChange={(e) => handleRoleChange(user, e.target.value as RoleType)}
                        disabled={disableAdminActions}
                      >
                        {roleOptions.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        className="h-8 w-40 rounded-md border border-input bg-background px-2 text-foreground"
                        value={user.category ?? ''}
                        onChange={(e) => handleCategoryChange(user, e.target.value)}
                        disabled={disableAdminActions}
                        placeholder="e.g., Premium, VIP"
                      />
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {user.metadata?.isActive ? 'Active' : 'Inactive'}
                    </td>
                  </tr>
                )
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
