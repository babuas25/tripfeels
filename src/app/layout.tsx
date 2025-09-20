import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import { AuthSessionProvider } from '@/components/providers/session-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { ThemeProvider as CustomThemeProvider } from '@/contexts/theme-context'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })
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
      <body className={`${inter.className} ${poppins.variable}`}>
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
