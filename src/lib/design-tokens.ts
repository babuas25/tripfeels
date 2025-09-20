/**
 * Design Tokens for TripFeels
 * Centralized color and styling tokens for consistent UI
 */

// Semantic color tokens
export const colors = {
  // Text colors
  text: {
    primary: 'text-foreground',
    secondary: 'text-muted-foreground',
    muted: 'text-muted-foreground',
    inverse: 'text-background',
  },
  
  // Background colors
  background: {
    primary: 'bg-background',
    secondary: 'bg-muted',
    card: 'bg-card',
    popover: 'bg-popover',
    inverse: 'bg-foreground',
  },
  
  // Border colors
  border: {
    primary: 'border-border',
    muted: 'border-muted',
    accent: 'border-accent',
  },
  
  // Interactive states
  interactive: {
    hover: 'hover:bg-accent hover:text-accent-foreground',
    active: 'bg-accent text-accent-foreground',
    focus: 'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    disabled: 'disabled:opacity-50 disabled:pointer-events-none',
  },
  
  // Glassmorphism effects
  glass: {
    light: 'backdrop-blur-md bg-white/80 border-white/20',
    dark: 'backdrop-blur-md bg-gray-900/80 border-gray-800/20',
    card: 'backdrop-blur-md bg-white/90 dark:bg-gray-900/90 border-white/20 dark:border-gray-800/20',
  },
} as const

// Spacing tokens
export const spacing = {
  xs: 'space-y-1',
  sm: 'space-y-2',
  md: 'space-y-4',
  lg: 'space-y-6',
  xl: 'space-y-8',
} as const

// Shadow tokens
export const shadows = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
} as const

// Border radius tokens
export const radius = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
} as const

// Component variants
export const variants = {
  button: {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  },
  
  card: {
    default: 'rounded-lg border bg-card text-card-foreground shadow-sm',
    glass: 'rounded-lg border backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-white/20 dark:border-gray-800/20 shadow-md',
  },
  
  input: {
    default: 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  },
} as const

// Responsive breakpoints
export const breakpoints = {
  sm: 'sm:',
  md: 'md:',
  lg: 'lg:',
  xl: 'xl:',
  '2xl': '2xl:',
} as const

// Animation tokens
export const animations = {
  transition: 'transition-all duration-200',
  transitionSlow: 'transition-all duration-300',
  hover: 'hover:opacity-100 hover:visible',
  fade: 'opacity-0 invisible group-hover:opacity-100 group-hover:visible',
} as const
