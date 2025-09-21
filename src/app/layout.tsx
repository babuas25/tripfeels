import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { Poppins } from 'next/font/google'
import { AuthSessionProvider } from '@/components/providers/session-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { ThemeProvider as CustomThemeProvider } from '@/contexts/theme-context'
import './globals.css'

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['600'],
  variable: '--font-poppins'
})

export const metadata: Metadata = {
  title: 'TripFeels - Role-Based Dashboard',
  description: 'A comprehensive role-based dashboard system for managing users, staff, partners, and agents.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('tripfeels-theme') || 'system';
                const root = document.documentElement;
                root.classList.remove('light', 'dark');
                
                if (theme === 'system') {
                  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  root.classList.add(systemTheme);
                } else {
                  root.classList.add(theme);
                }
              } catch (e) {
                // Fallback to system theme if localStorage is not available
                const root = document.documentElement;
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                root.classList.add(systemTheme);
              }
            `,
          }}
        />
      </head>
      <body className={`${GeistSans.className} ${poppins.variable}`}>
        <ThemeProvider
          defaultTheme="system"
          storageKey="tripfeels-theme"
        >
          <CustomThemeProvider>
            <AuthSessionProvider>
              {children}
            </AuthSessionProvider>
          </CustomThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
