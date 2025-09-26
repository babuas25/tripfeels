import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth'
import { adminDb } from '@/lib/firebase/admin'

export async function GET() {
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

    const snapshot = await adminDb.collection('users').limit(200).get()
    const users = snapshot.docs.map(d => ({ uid: d.id, ...d.data() }))
    return NextResponse.json({ users })
  } catch (err) {
    console.error('Error fetching users:', err)
    return NextResponse.json({ 
      error: 'Failed to fetch users',
      details: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.message : String(err)) : undefined
    }, { status: 500 })
  }
}


