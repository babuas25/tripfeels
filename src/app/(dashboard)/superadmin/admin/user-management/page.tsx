'use client'

import React, { useEffect, useMemo, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useSession } from 'next-auth/react'
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react'
import { type UserDocument, type RoleType } from '@/lib/firebase/firestore'
import { ROLES, ROLE_CATEGORIES, type CategoryType } from '@/lib/utils/constants'

export default function SuperAdminUserManagement() {
  const { data: session, status } = useSession()
  const currentUserRole = session?.user?.role as RoleType | undefined

  const [users, setUsers] = useState<UserDocument[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const [roleFilter, setRoleFilter] = useState<RoleType | 'All'>('All')
  const [search, setSearch] = useState<string>('')
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set())
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<UserDocument>>({})
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set())

  const roleOptions: RoleType[] = useMemo(() => [
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.STAFF,
    ROLES.PARTNER,
    ROLES.AGENT,
    ROLES.USER,
  ], [])

  // Get all unique categories from all roles
  const allCategories: CategoryType[] = useMemo(() => {
    const categories = new Set<string>()
    Object.values(ROLE_CATEGORIES).forEach(roleCategories => {
      roleCategories.forEach(category => categories.add(category))
    })
    return Array.from(categories).sort()
  }, [])

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

  const handleCategoryChange = async (targetUser: UserDocument, newCategory: CategoryType) => {
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

  const handleStatusChange = async (targetUser: UserDocument, newStatus: boolean) => {
    if (!canManage) return
    if (currentUserRole === ROLES.ADMIN && targetUser.role === ROLES.SUPER_ADMIN && !newStatus) {
      setError("Admins cannot deactivate SuperAdmin")
      return
    }
    try {
      setError(null)
      await fetch(`/api/admin/users/${targetUser.uid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus })
      })
      setUsers(prev => prev.map(u => u.uid === targetUser.uid ? { 
        ...u, 
        metadata: { ...u.metadata, isActive: newStatus }
      } : u))
    } catch (e) {
      setError('Failed to update status')
    }
  }

  const handleDeleteUser = async (targetUser: UserDocument) => {
    if (!canManage) return
    
    // Check if admin can delete this user
    if (currentUserRole === ROLES.ADMIN) {
      // Admin cannot delete SuperAdmin or Admin
      if (targetUser.role === ROLES.SUPER_ADMIN || targetUser.role === ROLES.ADMIN) {
        setError("Admins can only delete Staff, Partner, and Agent users")
        return
      }
      // Admin can only delete Staff, Partner, Agent
      if (![ROLES.STAFF, ROLES.PARTNER, ROLES.AGENT].includes(targetUser.role as any)) {
        setError("Admins can only delete Staff, Partner, and Agent users")
        return
      }
    }

    // Confirm deletion
    if (!confirm(`Are you sure you want to delete user "${targetUser.email}"? This action cannot be undone.`)) {
      return
    }

    try {
      setError(null)
      await fetch(`/api/admin/users/${targetUser.uid}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
      setUsers(prev => prev.filter(u => u.uid !== targetUser.uid))
    } catch (e) {
      setError('Failed to delete user')
    }
  }

  const toggleUserExpansion = (userId: string) => {
    setExpandedUsers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(userId)) {
        newSet.delete(userId)
        setEditingUser(null)
        setEditForm({})
      } else {
        newSet.add(userId)
      }
      return newSet
    })
  }

  const startEditing = (user: UserDocument) => {
    setEditingUser(user.uid)
    setEditForm({
      profile: {
        firstName: user.profile?.firstName || '',
        lastName: user.profile?.lastName || '',
        gender: user.profile?.gender || 'Other',
        dateOfBirth: user.profile?.dateOfBirth || '',
        mobile: user.profile?.mobile || '',
        avatar: user.profile?.avatar || ''
      },
      category: user.category || '',
      metadata: {
        isActive: user.metadata?.isActive ?? true,
        emailVerified: user.metadata?.emailVerified ?? false,
        createdAt: user.metadata?.createdAt,
        lastLoginAt: user.metadata?.lastLoginAt
      }
    })
  }

  const cancelEditing = () => {
    setEditingUser(null)
    setEditForm({})
  }

  const saveUserDetails = async (targetUser: UserDocument) => {
    if (!canManage) return
    if (currentUserRole === ROLES.ADMIN && targetUser.role === ROLES.SUPER_ADMIN) {
      setError("Admins cannot modify SuperAdmin details")
      return
    }
    
    try {
      setError(null)
      await fetch(`/api/admin/users/${targetUser.uid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: editForm.profile,
          category: editForm.category,
          isActive: editForm.metadata?.isActive
        })
      })
      
      setUsers(prev => prev.map(u => u.uid === targetUser.uid ? {
        ...u,
        profile: { ...u.profile, ...editForm.profile },
        category: editForm.category,
        metadata: { ...u.metadata, ...editForm.metadata }
      } : u))
      
      setEditingUser(null)
      setEditForm({})
    } catch (e) {
      setError('Failed to update user details')
    }
  }

  const toggleDropdown = (dropdownId: string) => {
    setOpenDropdowns(prev => {
      const newSet = new Set(prev)
      if (newSet.has(dropdownId)) {
        newSet.delete(dropdownId)
      } else {
        newSet.add(dropdownId)
      }
      return newSet
    })
  }

  const closeAllDropdowns = () => {
    setOpenDropdowns(new Set())
  }

  // Custom Toggle Switch Component
  const ToggleSwitch = ({ 
    id, 
    checked, 
    onChange, 
    disabled = false 
  }: {
    id: string
    checked: boolean
    onChange: (checked: boolean) => void
    disabled?: boolean
  }) => {
    return (
      <button
        type="button"
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
          checked 
            ? 'bg-gradient-to-r from-green-500/80 to-emerald-500/80 backdrop-blur-sm border border-green-400/30' 
            : 'bg-gradient-to-r from-gray-400/60 to-gray-500/60 backdrop-blur-sm border border-gray-400/30'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    )
  }

  // Custom Dropdown Component
  const CustomDropdown = ({ 
    id, 
    value, 
    options, 
    onChange, 
    disabled = false, 
    placeholder = "Select option" 
  }: {
    id: string
    value: string
    options: { value: string; label: string }[]
    onChange: (value: string) => void
    disabled?: boolean
    placeholder?: string
  }) => {
    const dropdownRef = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })
    const [mounted, setMounted] = useState(false)
    const isOpen = openDropdowns.has(id)

    useEffect(() => {
      setMounted(true)
    }, [])

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          closeAllDropdowns()
        }
      }

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [isOpen])

    useEffect(() => {
      if (isOpen && buttonRef.current && mounted) {
        const rect = buttonRef.current.getBoundingClientRect()
        const viewportHeight = window.innerHeight
        const viewportWidth = window.innerWidth
        const dropdownHeight = Math.min(options.length * 40 + 16, 200) // Max height of 200px
        const dropdownWidth = Math.max(rect.width, 120) // Min width of 120px
        
        // Check if dropdown would overflow bottom of viewport
        const wouldOverflowBottom = rect.bottom + dropdownHeight > viewportHeight - 20 // 20px margin from bottom
        
        // Check if dropdown would overflow right of viewport
        const wouldOverflowRight = rect.left + dropdownWidth > viewportWidth - 20 // 20px margin from right
        
        setPosition({
          top: wouldOverflowBottom ? rect.top - dropdownHeight - 8 : rect.bottom + 8,
          left: wouldOverflowRight ? rect.right - dropdownWidth : rect.left,
          width: dropdownWidth
        })
      }
    }, [isOpen, options.length, mounted])

    const handleSelect = (optionValue: string) => {
      onChange(optionValue)
      closeAllDropdowns()
    }

    const dropdownContent = isOpen && mounted ? (
      <div
        ref={dropdownRef}
        className="fixed z-[99999] rounded-xl border border-white/30 bg-white/80 backdrop-blur-xl shadow-xl overflow-hidden max-h-[200px] overflow-y-auto"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          width: `${position.width}px`
        }}
      >
        <div className="py-1">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className="w-full px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-white/50 transition-colors duration-200 text-left"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    ) : null

    return (
      <>
        <div className="relative">
          <button
            ref={buttonRef}
            type="button"
            onClick={() => !disabled && toggleDropdown(id)}
            disabled={disabled}
            className="w-full h-10 rounded-xl border border-white/30 bg-white/20 backdrop-blur-sm px-3 text-sm font-medium text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 appearance-none bg-gradient-to-r from-white/20 to-white/10 flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="truncate">
              {value || placeholder}
            </span>
            <ChevronDown className={`h-4 w-4 text-gray-600 dark:text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {mounted && dropdownContent && createPortal(dropdownContent, document.body)}
      </>
    )
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

           <div className="flex gap-2 relative z-10">
             <input
               id="user-search"
               name="user-search"
               type="text"
               placeholder="Search by name, email, or category"
               className="h-9 w-64 rounded-lg border border-white/30 bg-white/20 backdrop-blur-sm px-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
             />
             <CustomDropdown
               id="role-filter"
               value={roleFilter}
               options={[
                 { value: 'All', label: 'All Roles' },
                 ...roleOptions.map(r => ({ value: r, label: r }))
               ]}
               onChange={(value) => setRoleFilter(value as RoleType | 'All')}
             />
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
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-white/30 bg-white/20 backdrop-blur-md shadow-lg overflow-visible">
          <table className="min-w-full text-sm">
            <thead className="bg-white/20 backdrop-blur-sm">
              <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-900 dark:text-gray-100 w-8"></th>
                <th className="text-left px-4 py-3 font-medium text-gray-900 dark:text-gray-100">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-900 dark:text-gray-100">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-900 dark:text-gray-100">Role</th>
                <th className="text-left px-4 py-3 font-medium text-gray-900 dark:text-gray-100">Category</th>
                <th className="text-left px-4 py-3 font-medium text-gray-900 dark:text-gray-100">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-900 dark:text-gray-100">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, idx) => {
                const fullName = `${user.profile?.firstName ?? ''} ${user.profile?.lastName ?? ''}`.trim()
                const isSuperAdmin = user.role === ROLES.SUPER_ADMIN
                const disableAdminActions = currentUserRole === ROLES.ADMIN && isSuperAdmin
                const disableStatusChange = currentUserRole === ROLES.ADMIN && isSuperAdmin
                const canDeleteUser = currentUserRole === ROLES.SUPER_ADMIN || 
                  (currentUserRole === ROLES.ADMIN && [ROLES.STAFF, ROLES.PARTNER, ROLES.AGENT].includes(user.role as any))
                  
                  // Get categories available for this user's role
                  const availableCategories = ROLE_CATEGORIES[user.role] || []
                  
                  const isExpanded = expandedUsers.has(user.uid)
                  const isEditing = editingUser === user.uid
                  
                return (
                    <React.Fragment key={user.uid ?? `${user.email}-${idx}`}>
                      <tr className="border-t border-white/30 hover:bg-white/10 transition-colors">
                        <td className="px-2 py-3">
                          <button
                            onClick={() => toggleUserExpansion(user.uid)}
                            className="p-1 hover:bg-white/20 rounded transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            )}
                          </button>
                        </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{fullName || '—'}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{user.email}</td>
                    <td className="px-4 py-3">
                        <div className="w-32">
                          <CustomDropdown
                            id={`desktop-role-${user.uid}`}
                            value={user.role}
                            options={roleOptions.map(r => ({ value: r, label: r }))}
                            onChange={(value) => handleRoleChange(user, value as RoleType)}
                            disabled={disableAdminActions}
                          />
                        </div>
                    </td>
                    <td className="px-4 py-3">
                        <div className="w-40">
                          <CustomDropdown
                            id={`desktop-category-${user.uid}`}
                            value={user.category ?? ''}
                            options={[
                              { value: '', label: 'Select Category' },
                              ...availableCategories.map(category => ({ value: category, label: category }))
                            ]}
                            onChange={(value) => handleCategoryChange(user, value as CategoryType)}
                            disabled={disableAdminActions}
                          />
                        </div>
                        </td>
                         <td className="px-4 py-3">
                         <div className="flex items-center justify-center">
                           <ToggleSwitch
                             id={`desktop-status-${user.uid}`}
                             checked={user.metadata?.isActive ?? false}
                             onChange={(checked) => handleStatusChange(user, checked)}
                             disabled={disableStatusChange}
                           />
                         </div>
                         </td>
                         <td className="px-4 py-3">
                           <div className="flex items-center justify-center">
                             {canDeleteUser && (
                               <button
                                 onClick={() => handleDeleteUser(user)}
                                 className="p-2 rounded-lg bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/30 transition-colors duration-200"
                                 title="Delete user"
                               >
                                 <Trash2 className="h-4 w-4" />
                               </button>
                             )}
                           </div>
                         </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={7} className="px-4 py-4 bg-white/10">
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <h4 className="font-medium text-gray-900 dark:text-gray-100">User Details</h4>
                                {!isEditing && !disableAdminActions && (
                                  <button
                                    onClick={() => startEditing(user)}
                                    className="px-3 py-1 text-sm bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                                  >
                                    Edit Details
                                  </button>
                                )}
                              </div>
                              
                              {isEditing ? (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        First Name
                                      </label>
                                      <input
                                        type="text"
                                        value={editForm.profile?.firstName || ''}
                                        onChange={(e) => setEditForm(prev => ({
                                          ...prev,
                                          profile: { 
                                            ...prev.profile, 
                                            firstName: e.target.value,
                                            lastName: prev.profile?.lastName || '',
                                            gender: prev.profile?.gender || 'Other',
                                            dateOfBirth: prev.profile?.dateOfBirth || '',
                                            mobile: prev.profile?.mobile || '',
                                            avatar: prev.profile?.avatar || ''
                                          }
                                        }))}
                                        className="w-full h-8 rounded-lg border border-white/30 bg-white/20 backdrop-blur-sm px-2 text-sm text-gray-900 dark:text-gray-100"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Last Name
                                      </label>
                                      <input
                                        type="text"
                                        value={editForm.profile?.lastName || ''}
                                        onChange={(e) => setEditForm(prev => ({
                                          ...prev,
                                          profile: { 
                                            ...prev.profile, 
                                            lastName: e.target.value,
                                            firstName: prev.profile?.firstName || '',
                                            gender: prev.profile?.gender || 'Other',
                                            dateOfBirth: prev.profile?.dateOfBirth || '',
                                            mobile: prev.profile?.mobile || '',
                                            avatar: prev.profile?.avatar || ''
                                          }
                                        }))}
                                        className="w-full h-8 rounded-lg border border-white/30 bg-white/20 backdrop-blur-sm px-2 text-sm text-gray-900 dark:text-gray-100"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Gender
                                      </label>
                                      <select
                                        value={editForm.profile?.gender || 'Other'}
                                        onChange={(e) => setEditForm(prev => ({
                                          ...prev,
                                          profile: { 
                                            ...prev.profile, 
                                            gender: e.target.value as 'Male' | 'Female' | 'Other',
                                            firstName: prev.profile?.firstName || '',
                                            lastName: prev.profile?.lastName || '',
                                            dateOfBirth: prev.profile?.dateOfBirth || '',
                                            mobile: prev.profile?.mobile || '',
                                            avatar: prev.profile?.avatar || ''
                                          }
                                        }))}
                                        className="w-full h-8 rounded-lg border border-white/30 bg-white/20 backdrop-blur-sm px-2 text-sm text-gray-900 dark:text-gray-100"
                                      >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Mobile
                                      </label>
                      <input
                        type="text"
                                        value={editForm.profile?.mobile || ''}
                                        onChange={(e) => setEditForm(prev => ({
                                          ...prev,
                                          profile: { 
                                            ...prev.profile, 
                                            mobile: e.target.value,
                                            firstName: prev.profile?.firstName || '',
                                            lastName: prev.profile?.lastName || '',
                                            gender: prev.profile?.gender || 'Other',
                                            dateOfBirth: prev.profile?.dateOfBirth || '',
                                            avatar: prev.profile?.avatar || ''
                                          }
                                        }))}
                                        className="w-full h-8 rounded-lg border border-white/30 bg-white/20 backdrop-blur-sm px-2 text-sm text-gray-900 dark:text-gray-100"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Date of Birth
                                      </label>
                                      <input
                                        type="date"
                                        value={editForm.profile?.dateOfBirth || ''}
                                        onChange={(e) => setEditForm(prev => ({
                                          ...prev,
                                          profile: { 
                                            ...prev.profile, 
                                            dateOfBirth: e.target.value,
                                            firstName: prev.profile?.firstName || '',
                                            lastName: prev.profile?.lastName || '',
                                            gender: prev.profile?.gender || 'Other',
                                            mobile: prev.profile?.mobile || '',
                                            avatar: prev.profile?.avatar || ''
                                          }
                                        }))}
                                        className="w-full h-8 rounded-lg border border-white/30 bg-white/20 backdrop-blur-sm px-2 text-sm text-gray-900 dark:text-gray-100"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Avatar URL
                                      </label>
                                      <input
                                        type="url"
                                        value={editForm.profile?.avatar || ''}
                                        onChange={(e) => setEditForm(prev => ({
                                          ...prev,
                                          profile: { 
                                            ...prev.profile, 
                                            avatar: e.target.value,
                                            firstName: prev.profile?.firstName || '',
                                            lastName: prev.profile?.lastName || '',
                                            gender: prev.profile?.gender || 'Other',
                                            dateOfBirth: prev.profile?.dateOfBirth || '',
                                            mobile: prev.profile?.mobile || ''
                                          }
                                        }))}
                                        className="w-full h-8 rounded-lg border border-white/30 bg-white/20 backdrop-blur-sm px-2 text-sm text-gray-900 dark:text-gray-100"
                                      />
                                    </div>
                                  </div>
                                  
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => saveUserDetails(user)}
                                      className="px-4 py-2 bg-green-500/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                                    >
                                      Save Changes
                                    </button>
                                    <button
                                      onClick={cancelEditing}
                                      className="px-4 py-2 bg-gray-500/20 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-500/30 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Full Name:</span>
                                    <span className="ml-2 text-gray-900 dark:text-gray-100">{fullName || 'Not provided'}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span>
                                    <span className="ml-2 text-gray-900 dark:text-gray-100">{user.email}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Gender:</span>
                                    <span className="ml-2 text-gray-900 dark:text-gray-100">{user.profile?.gender || 'Not provided'}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Mobile:</span>
                                    <span className="ml-2 text-gray-900 dark:text-gray-100">{user.profile?.mobile || 'Not provided'}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Date of Birth:</span>
                                    <span className="ml-2 text-gray-900 dark:text-gray-100">{user.profile?.dateOfBirth || 'Not provided'}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Email Verified:</span>
                                    <span className="ml-2 text-gray-900 dark:text-gray-100">{user.metadata?.emailVerified ? 'Yes' : 'No'}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Created At:</span>
                                    <span className="ml-2 text-gray-900 dark:text-gray-100">
                                      {user.metadata?.createdAt ? new Date(user.metadata.createdAt.seconds * 1000).toLocaleDateString() : 'Not available'}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Last Login:</span>
                                    <span className="ml-2 text-gray-900 dark:text-gray-100">
                                      {user.metadata?.lastLoginAt ? new Date(user.metadata.lastLoginAt.seconds * 1000).toLocaleDateString() : 'Not available'}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                    </td>
                  </tr>
                      )}
                    </React.Fragment>
                )
              })}
               {filteredUsers.length === 0 && (
                 <tr>
                     <td colSpan={7} className="px-4 py-6 text-center text-gray-600 dark:text-gray-400">No users found.</td>
                 </tr>
               )}
            </tbody>
          </table>
        </div>

           {/* Mobile Card View */}
           <div className="md:hidden space-y-4 overflow-visible relative z-0">
            {filteredUsers.map((user, idx) => {
              const fullName = `${user.profile?.firstName ?? ''} ${user.profile?.lastName ?? ''}`.trim()
              const isSuperAdmin = user.role === ROLES.SUPER_ADMIN
              const disableAdminActions = currentUserRole === ROLES.ADMIN && isSuperAdmin
              const disableStatusChange = currentUserRole === ROLES.ADMIN && isSuperAdmin
              const canDeleteUser = currentUserRole === ROLES.SUPER_ADMIN || 
                (currentUserRole === ROLES.ADMIN && [ROLES.STAFF, ROLES.PARTNER, ROLES.AGENT].includes(user.role as any))
              
              // Get categories available for this user's role
              const availableCategories = ROLE_CATEGORIES[user.role] || []
              
              const isExpanded = expandedUsers.has(user.uid)
              const isEditing = editingUser === user.uid
              
              return (
                 <div key={user.uid ?? `${user.email}-${idx}`} className="group rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-white/15 overflow-visible relative z-0">
                  {/* User Card Header */}
                  <div className="p-6">
                    {/* Header with Avatar and Actions */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                          {fullName ? fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {fullName || 'Unnamed User'}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleUserExpansion(user.uid)}
                        className="p-2 rounded-full hover:bg-white/20 transition-colors duration-200 group-hover:bg-white/30"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        )}
                      </button>
                    </div>
                    
                    {/* Status Pills */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 shadow-sm">
                        {user.role}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                        user.metadata?.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                      }`}>
                        {user.metadata?.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {user.category && (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 shadow-sm">
                          {user.category}
                        </span>
                      )}
                    </div>
                    
                    {/* Last Login Info */}
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                      <span className="font-medium">Last Login:</span> {user.metadata?.lastLoginAt ? new Date(user.metadata.lastLoginAt.seconds * 1000).toLocaleDateString() : 'Not available'}
                    </div>
                    
                     {/* Quick Actions */}
                     <div className="space-y-3 overflow-visible relative z-0">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Role</label>
                        <CustomDropdown
                          id={`mobile-role-${user.uid}`}
                          value={user.role}
                          options={roleOptions.map(r => ({ value: r, label: r }))}
                          onChange={(value) => handleRoleChange(user, value as RoleType)}
                          disabled={disableAdminActions}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Category</label>
                        <CustomDropdown
                          id={`mobile-category-${user.uid}`}
                          value={user.category ?? ''}
                          options={[
                            { value: '', label: 'Select Category' },
                            ...availableCategories.map(category => ({ value: category, label: category }))
                          ]}
                          onChange={(value) => handleCategoryChange(user, value as CategoryType)}
                          disabled={disableAdminActions}
                        />
                      </div>
                      
                       <div>
                         <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Status</label>
                         <div className="flex items-center justify-between">
                           <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                             {user.metadata?.isActive ? 'Active' : 'Inactive'}
                           </span>
                           <ToggleSwitch
                             id={`mobile-status-${user.uid}`}
                             checked={user.metadata?.isActive ?? false}
                             onChange={(checked) => handleStatusChange(user, checked)}
                             disabled={disableStatusChange}
                           />
                         </div>
                       </div>
                    </div>
                  </div>
                  
                   {/* Expanded Details */}
                   {isExpanded && (
                     <div className="px-6 pb-6 bg-gradient-to-br from-white/5 to-white/10 border-t border-white/10 overflow-visible relative z-0">
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">User Details</h4>
                          <div className="flex gap-2">
                            {canDeleteUser && (
                              <button
                                onClick={() => handleDeleteUser(user)}
                                className="px-4 py-2 text-sm font-medium bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-500/30 transition-all duration-200 hover:shadow-lg flex items-center gap-2"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete User
                              </button>
                            )}
                            {!isEditing && !disableAdminActions && (
                              <button
                                onClick={() => startEditing(user)}
                                className="px-4 py-2 text-sm font-medium bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-500/30 transition-all duration-200 hover:shadow-lg"
                              >
                                Edit Details
                              </button>
                            )}
                          </div>
                        </div>
                        
                         {isEditing ? (
                           <div className="space-y-6 overflow-visible relative z-0">
                             <div className="grid grid-cols-1 gap-4 overflow-visible relative z-0">
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  First Name
                                </label>
                                <input
                                  type="text"
                                  value={editForm.profile?.firstName || ''}
                                  onChange={(e) => setEditForm(prev => ({
                                    ...prev,
                                    profile: { 
                                      ...prev.profile, 
                                      firstName: e.target.value,
                                      lastName: prev.profile?.lastName || '',
                                      gender: prev.profile?.gender || 'Other',
                                      dateOfBirth: prev.profile?.dateOfBirth || '',
                                      mobile: prev.profile?.mobile || '',
                                      avatar: prev.profile?.avatar || ''
                                    }
                                  }))}
                                  className="w-full h-11 rounded-xl border border-white/30 bg-white/20 backdrop-blur-sm px-4 text-sm font-medium text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  Last Name
                                </label>
                                <input
                                  type="text"
                                  value={editForm.profile?.lastName || ''}
                                  onChange={(e) => setEditForm(prev => ({
                                    ...prev,
                                    profile: { 
                                      ...prev.profile, 
                                      lastName: e.target.value,
                                      firstName: prev.profile?.firstName || '',
                                      gender: prev.profile?.gender || 'Other',
                                      dateOfBirth: prev.profile?.dateOfBirth || '',
                                      mobile: prev.profile?.mobile || '',
                                      avatar: prev.profile?.avatar || ''
                                    }
                                  }))}
                                  className="w-full h-11 rounded-xl border border-white/30 bg-white/20 backdrop-blur-sm px-4 text-sm font-medium text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  Gender
                                </label>
                                <CustomDropdown
                                  id={`edit-gender-${user.uid}`}
                                  value={editForm.profile?.gender || 'Other'}
                                  options={[
                                    { value: 'Male', label: 'Male' },
                                    { value: 'Female', label: 'Female' },
                                    { value: 'Other', label: 'Other' }
                                  ]}
                                  onChange={(value) => setEditForm(prev => ({
                                    ...prev,
                                    profile: { 
                                      ...prev.profile, 
                                      gender: value as 'Male' | 'Female' | 'Other',
                                      firstName: prev.profile?.firstName || '',
                                      lastName: prev.profile?.lastName || '',
                                      dateOfBirth: prev.profile?.dateOfBirth || '',
                                      mobile: prev.profile?.mobile || '',
                                      avatar: prev.profile?.avatar || ''
                                    }
                                  }))}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  Mobile
                                </label>
                                <input
                                  type="text"
                                  value={editForm.profile?.mobile || ''}
                                  onChange={(e) => setEditForm(prev => ({
                                    ...prev,
                                    profile: { 
                                      ...prev.profile, 
                                      mobile: e.target.value,
                                      firstName: prev.profile?.firstName || '',
                                      lastName: prev.profile?.lastName || '',
                                      gender: prev.profile?.gender || 'Other',
                                      dateOfBirth: prev.profile?.dateOfBirth || '',
                                      avatar: prev.profile?.avatar || ''
                                    }
                                  }))}
                                  className="w-full h-11 rounded-xl border border-white/30 bg-white/20 backdrop-blur-sm px-4 text-sm font-medium text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  Date of Birth
                                </label>
                                <input
                                  type="date"
                                  value={editForm.profile?.dateOfBirth || ''}
                                  onChange={(e) => setEditForm(prev => ({
                                    ...prev,
                                    profile: { 
                                      ...prev.profile, 
                                      dateOfBirth: e.target.value,
                                      firstName: prev.profile?.firstName || '',
                                      lastName: prev.profile?.lastName || '',
                                      gender: prev.profile?.gender || 'Other',
                                      mobile: prev.profile?.mobile || '',
                                      avatar: prev.profile?.avatar || ''
                                    }
                                  }))}
                                  className="w-full h-11 rounded-xl border border-white/30 bg-white/20 backdrop-blur-sm px-4 text-sm font-medium text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  Avatar URL
                                </label>
                                <input
                                  type="url"
                                  value={editForm.profile?.avatar || ''}
                                  onChange={(e) => setEditForm(prev => ({
                                    ...prev,
                                    profile: { 
                                      ...prev.profile, 
                                      avatar: e.target.value,
                                      firstName: prev.profile?.firstName || '',
                                      lastName: prev.profile?.lastName || '',
                                      gender: prev.profile?.gender || 'Other',
                                      dateOfBirth: prev.profile?.dateOfBirth || '',
                                      mobile: prev.profile?.mobile || ''
                                    }
                                  }))}
                                  className="w-full h-11 rounded-xl border border-white/30 bg-white/20 backdrop-blur-sm px-4 text-sm font-medium text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                />
                              </div>
                            </div>
                            
                            <div className="flex gap-3 pt-2">
                              <button
                                onClick={() => saveUserDetails(user)}
                                className="flex-1 px-6 py-3 bg-green-500/20 text-green-600 dark:text-green-400 rounded-xl hover:bg-green-500/30 transition-all duration-200 font-semibold hover:shadow-lg"
                              >
                                Save Changes
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="flex-1 px-6 py-3 bg-gray-500/20 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-500/30 transition-all duration-200 font-semibold hover:shadow-lg"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                              <div className="flex justify-between items-center py-2 border-b border-white/10">
                                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Full Name</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{fullName || 'Not provided'}</span>
                              </div>
                              <div className="flex justify-between items-center py-2 border-b border-white/10">
                                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Email</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.email}</span>
                              </div>
                              <div className="flex justify-between items-center py-2 border-b border-white/10">
                                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Gender</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.profile?.gender || 'Not provided'}</span>
                              </div>
                              <div className="flex justify-between items-center py-2 border-b border-white/10">
                                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Mobile</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.profile?.mobile || 'Not provided'}</span>
                              </div>
                              <div className="flex justify-between items-center py-2 border-b border-white/10">
                                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Date of Birth</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.profile?.dateOfBirth || 'Not provided'}</span>
                              </div>
                              <div className="flex justify-between items-center py-2 border-b border-white/10">
                                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Email Verified</span>
                                <span className={`text-sm font-medium ${user.metadata?.emailVerified ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                  {user.metadata?.emailVerified ? 'Yes' : 'No'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center py-2 border-b border-white/10">
                                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Created At</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {user.metadata?.createdAt ? new Date(user.metadata.createdAt.seconds * 1000).toLocaleDateString() : 'Not available'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center py-2">
                                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Last Login</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {user.metadata?.lastLoginAt ? new Date(user.metadata.lastLoginAt.seconds * 1000).toLocaleDateString() : 'Not available'}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            
            {filteredUsers.length === 0 && (
              <div className="p-6 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-xl border border-white/30 dark:border-white/20 shadow-lg text-center">
                <p className="text-gray-600 dark:text-gray-400">No users found.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
