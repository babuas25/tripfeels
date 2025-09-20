import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { DASHBOARD_ROUTES, ROLES } from "@/lib/utils/constants"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Redirect authenticated users from auth page to their dashboard
    if (pathname === '/auth' && token) {
      const userRole = token.role as keyof typeof DASHBOARD_ROUTES
      const dashboardRoute = DASHBOARD_ROUTES[userRole] || DASHBOARD_ROUTES.User
      return NextResponse.redirect(new URL(dashboardRoute, req.url))
    }

    // Allow access to public routes for unauthenticated users
    if ((pathname === '/' || pathname === '/auth') && !token) {
      return NextResponse.next()
    }

    // Redirect unauthenticated users to auth page for protected routes
    if (!token) {
      return NextResponse.redirect(new URL('/auth', req.url))
    }

    const userRole = token.role as keyof typeof DASHBOARD_ROUTES

    // Check if user is accessing the correct dashboard for their role
    if (pathname.startsWith('/superadmin/admin')) {
      if (userRole !== ROLES.SUPER_ADMIN) {
        return NextResponse.redirect(new URL(DASHBOARD_ROUTES[userRole], req.url))
      }
    } else if (pathname.startsWith('/users/admin')) {
      if (userRole !== ROLES.ADMIN) {
        return NextResponse.redirect(new URL(DASHBOARD_ROUTES[userRole], req.url))
      }
    } else if (pathname.startsWith('/users/staff')) {
      if (userRole !== ROLES.STAFF) {
        return NextResponse.redirect(new URL(DASHBOARD_ROUTES[userRole], req.url))
      }
    } else if (pathname.startsWith('/users/partner')) {
      if (userRole !== ROLES.PARTNER) {
        return NextResponse.redirect(new URL(DASHBOARD_ROUTES[userRole], req.url))
      }
    } else if (pathname.startsWith('/users/agent')) {
      if (userRole !== ROLES.AGENT) {
        return NextResponse.redirect(new URL(DASHBOARD_ROUTES[userRole], req.url))
      }
    } else if (pathname.startsWith('/users/publicuser')) {
      if (userRole !== ROLES.USER) {
        return NextResponse.redirect(new URL(DASHBOARD_ROUTES[userRole], req.url))
      }
    }

    // Redirect to appropriate dashboard if accessing generic /dashboard
    if (pathname === '/dashboard') {
      return NextResponse.redirect(new URL(DASHBOARD_ROUTES[userRole], req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Allow public routes
        if (pathname === '/' || pathname === '/auth') {
          return true
        }

        // Require authentication for all other routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
