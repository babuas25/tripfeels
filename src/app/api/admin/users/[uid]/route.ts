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
    const session = await getServerSession(authOptions)
    const role = session?.user?.role as string | undefined

    if (!session || !role || (role !== 'SuperAdmin' && role !== 'Admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { role: newRole, category } = await req.json()
    const { uid } = await params

    // Admin restriction: cannot modify SuperAdmin or assign SuperAdmin
    if (role === 'Admin') {
      if (newRole === 'SuperAdmin') {
        return NextResponse.json({ error: 'Admins cannot assign SuperAdmin' }, { status: 400 })
      }
      const targetDoc = await adminDb.collection('users').doc(uid).get()
      if (targetDoc.exists && targetDoc.data()?.role === 'SuperAdmin') {
        return NextResponse.json({ error: 'Admins cannot modify SuperAdmin' }, { status: 400 })
      }
    }

    const updates: Record<string, any> = {}
    if (newRole) updates.role = newRole
    if (category !== undefined) updates.category = category

    await adminDb.collection('users').doc(uid).update(updates)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 })
}


