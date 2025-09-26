// Role definitions
export const ROLES = {
  SUPER_ADMIN: 'SuperAdmin',
  ADMIN: 'Admin',
  STAFF: 'Staff',
  PARTNER: 'Partner',
  AGENT: 'Agent',
  USER: 'User'
} as const

export type RoleType = typeof ROLES[keyof typeof ROLES]

// Sub-role definitions
export const SUB_ROLES = {
  STAFF: {
    ACCOUNTS: 'Accounts',
    SUPPORT: 'Support',
    KEY_MANAGER: 'Key Manager',
    RESEARCH: 'Research',
    MEDIA: 'Media',
    SALES: 'Sales'
  },
  PARTNER: {
    SUPPLIER: 'Supplier',
    SERVICE_PROVIDER: 'Service Provider'
  },
  AGENT: {
    DISTRIBUTOR: 'Distributor',
    FRANCHISE: 'Franchise',
    B2B: 'B2B'
  }
} as const

// Role hierarchy for access control
export const ROLE_HIERARCHY = {
  [ROLES.SUPER_ADMIN]: 6,
  [ROLES.ADMIN]: 5,
  [ROLES.STAFF]: 4,
  [ROLES.PARTNER]: 3,
  [ROLES.AGENT]: 2,
  [ROLES.USER]: 1
} as const

// Role assignment permissions
export const ROLE_ASSIGNMENT_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.STAFF, ROLES.PARTNER, ROLES.AGENT, ROLES.USER],
  [ROLES.ADMIN]: [ROLES.STAFF, ROLES.PARTNER, ROLES.AGENT, ROLES.USER],
  [ROLES.STAFF]: [],
  [ROLES.PARTNER]: [],
  [ROLES.AGENT]: [],
  [ROLES.USER]: []
} as const

// Dashboard routes by role
export const DASHBOARD_ROUTES = {
  [ROLES.SUPER_ADMIN]: '/superadmin/admin',
  [ROLES.ADMIN]: '/users/admin',
  [ROLES.STAFF]: '/users/staff',
  [ROLES.PARTNER]: '/users/partner',
  [ROLES.AGENT]: '/users/agent',
  [ROLES.USER]: '/users/publicuser'
} as const

// Role-based categories
export const ROLE_CATEGORIES = {
  [ROLES.SUPER_ADMIN]: ['Admin'],
  [ROLES.ADMIN]: ['Admin'],
  [ROLES.STAFF]: ['Accounts', 'Support', 'Key Manager', 'Research', 'Media', 'Sales'],
  [ROLES.PARTNER]: ['Supplier', 'Service Provider'],
  [ROLES.AGENT]: ['Distributor', 'Franchise', 'B2B'],
  [ROLES.USER]: ['Default']
} as const

export type CategoryType = string

// Special admin emails
export const SUPER_ADMIN_EMAILS = [
  'babuas25@gmail.com',
  'md.ashifbabu@gmail.com'
] as const

// Navigation menu items by role
export const NAVIGATION_ITEMS = {
  [ROLES.SUPER_ADMIN]: [
    { label: 'Dashboard', href: '/superadmin/admin', icon: 'Home' },
    { label: 'User Management', href: '/superadmin/admin/user-management', icon: 'Users' },
    { label: 'Theme', href: '/superadmin/theme', icon: 'Palette' },
  ],
  [ROLES.ADMIN]: [
    { label: 'Dashboard', href: '/users/admin', icon: 'Home' },
    { label: 'User Management', href: '/users/admin/user-management', icon: 'Users' },
  ],
  [ROLES.STAFF]: [
    { label: 'Dashboard', href: '/users/staff', icon: 'Home' },
  ],
  [ROLES.PARTNER]: [
    { label: 'Dashboard', href: '/users/partner', icon: 'Home' },
  ],
  [ROLES.AGENT]: [
    { label: 'Dashboard', href: '/users/agent', icon: 'Home' },
  ],
  [ROLES.USER]: [
    { label: 'Dashboard', href: '/users/publicuser', icon: 'Home' },
  ],
} as const
