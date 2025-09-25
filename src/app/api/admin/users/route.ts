import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth'
import { adminDb } from '@/lib/firebase/admin'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const role = session?.user?.role as string | undefined

    if (!session || !role || (role !== 'SuperAdmin' && role !== 'Admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const snapshot = await adminDb.collection('users').limit(200).get()
    const users = snapshot.docs.map(d => ({ uid: d.id, ...d.data() }))
    return NextResponse.json({ users })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}


