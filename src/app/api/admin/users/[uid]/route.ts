import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth'
import { adminDb } from '@/lib/firebase/admin'

export const revalidate = 0

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    // Check Firebase Admin configuration
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      console.error('Firebase Admin environment variables are missing')
      return NextResponse.json({ 
        error: 'Server configuration error: Firebase Admin credentials not configured' 
      }, { status: 500 })
    }

    const session = await getServerSession(authOptions)
    const role = session?.user?.role as string | undefined

    if (!session || !role || (role !== 'SuperAdmin' && role !== 'Admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { role: newRole, category, isActive, profile } = await req.json()
    const { uid } = await params

    // Get target user data
    const targetDoc = await adminDb.collection('users').doc(uid).get()
    const targetUser = targetDoc.exists ? targetDoc.data() : null

    // Admin restriction: cannot modify SuperAdmin or assign SuperAdmin
    if (role === 'Admin') {
      if (newRole === 'SuperAdmin') {
        return NextResponse.json({ error: 'Admins cannot assign SuperAdmin' }, { status: 400 })
      }
      if (targetUser?.role === 'SuperAdmin') {
        // Admin cannot modify SuperAdmin role, category, or profile
        if (newRole || category !== undefined || profile) {
          return NextResponse.json({ error: 'Admins cannot modify SuperAdmin' }, { status: 400 })
        }
        // Admin cannot deactivate SuperAdmin
        if (isActive === false) {
          return NextResponse.json({ error: 'Admins cannot deactivate SuperAdmin' }, { status: 400 })
        }
      }
    }

    const updates: Record<string, any> = {}
    if (newRole) updates.role = newRole
    if (category !== undefined) updates.category = category
    if (isActive !== undefined) updates['metadata.isActive'] = isActive
    if (profile) {
      // Update profile fields individually
      Object.keys(profile).forEach(key => {
        if (profile[key] !== undefined) {
          updates[`profile.${key}`] = profile[key]
        }
      })
    }

    await adminDb.collection('users').doc(uid).update(updates)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Error updating user:', err)
    return NextResponse.json({ 
      error: 'Failed to update user',
      details: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.message : String(err)) : undefined
    }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    // Check Firebase Admin configuration
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      console.error('Firebase Admin environment variables are missing')
      return NextResponse.json({ 
        error: 'Server configuration error: Firebase Admin credentials not configured' 
      }, { status: 500 })
    }

    const session = await getServerSession(authOptions)
    const role = session?.user?.role as string | undefined

    if (!session || !role || (role !== 'SuperAdmin' && role !== 'Admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { uid } = await params

    // Get target user data
    const targetDoc = await adminDb.collection('users').doc(uid).get()
    const targetUser = targetDoc.exists ? targetDoc.data() : null

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Admin restriction: can only delete Staff, Partner, Agent
    if (role === 'Admin') {
      if (targetUser.role === 'SuperAdmin' || targetUser.role === 'Admin') {
        return NextResponse.json({ error: 'Admins can only delete Staff, Partner, and Agent users' }, { status: 400 })
      }
      if (!['Staff', 'Partner', 'Agent'].includes(targetUser.role as any)) {
        return NextResponse.json({ error: 'Admins can only delete Staff, Partner, and Agent users' }, { status: 400 })
      }
    }

    // Delete the user
    await adminDb.collection('users').doc(uid).delete()
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Error deleting user:', err)
    return NextResponse.json({ 
      error: 'Failed to delete user',
      details: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.message : String(err)) : undefined
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 })
}


