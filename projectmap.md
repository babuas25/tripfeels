src/
├── app/                          # Next.js 14 App Router
│   ├── (auth)/                   # Route groups
│   │   ├── auth/
│   │   │   ├── page.tsx         # Sign In/Register
│   │   │   └── loading.tsx
│   │   └── layout.tsx           # Auth layout
│   ├── (dashboard)/             
│   │   ├── dashboard/           # Main dashboard
│   │   ├── superadmin/
│   │   │   └── admin/
│   │   │       └── page.tsx     # SuperAdmin dashboard
│   │   └── users/
│   │       ├── admin/           # Admin dashboard
│   │       ├── staff/           # Staff dashboard
│   │       ├── partner/         # Partner dashboard
│   │       ├── agent/           # Agent dashboard
│   │       └── publicuser/      # User dashboard
│   ├── api/                     # API routes
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts     # NextAuth configuration
│   │   ├── users/
│   │   │   ├── roles/           # Role management
│   │   │   └── profile/         # User profile
│   │   └── admin/               # Admin operations
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   └── not-found.tsx           
├── components/
│   ├── ui/                      # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── tabs.tsx
│   │   └── ...
│   ├── layout/                  # Layout components
│   │   ├── navbar.tsx
│   │   ├── sidebar.tsx
│   │   ├── footer.tsx
│   │   └── breadcrumb.tsx
│   ├── forms/                   # Form components
│   │   ├── sign-in-form.tsx
│   │   ├── register-form.tsx
│   │   └── profile-form.tsx
│   ├── dashboard/               # Dashboard widgets
│   │   ├── stats-card.tsx
│   │   ├── activity-feed.tsx
│   │   ├── quick-actions.tsx
│   │   └── analytics-chart.tsx
│   └── providers/               # Context providers
│       ├── auth-provider.tsx
│       ├── theme-provider.tsx
│       └── role-provider.tsx
├── lib/
│   ├── firebase/               # Firebase configuration
│   │   ├── config.ts           # Firebase client config
│   │   ├── admin.ts            # Firebase Admin SDK
│   │   ├── firestore.ts        # Firestore utilities
│   │   └── auth.ts             # Auth utilities
│   ├── auth/                   # Authentication
│   │   ├── nextauth.ts         # NextAuth configuration
│   │   ├── providers.ts        # Auth providers
│   │   └── callbacks.ts        # NextAuth callbacks
│   ├── utils/                  # Utility functions
│   │   ├── cn.ts               # Class name utility
│   │   ├── validation.ts       # Zod schemas
│   │   ├── constants.ts        # App constants
│   │   └── helpers.ts          # Helper functions
│   └── hooks/                  # Custom React hooks
│       ├── useAuth.ts
│       ├── useRole.ts
│       └── useFirestore.ts
├── middleware.ts               # Route protection
├── tailwind.config.ts          # Tailwind configuration
├── next.config.js              # Next.js configuration
└── package.json