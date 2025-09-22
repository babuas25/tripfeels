import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth'
import { adminDb } from '@/lib/firebase/admin'

export const dynamic = 'force-dynamic'

export async function PATCH(request: NextRequest, context: any) {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'SuperAdmin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const body = await request.json()
  const { id } = (context?.params ?? {}) as { id: string }
  await adminDb.collection('auth_slides').doc(id).update(body)
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: NextRequest, context: any) {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'SuperAdmin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { id } = (context?.params ?? {}) as { id: string }
  await adminDb.collection('auth_slides').doc(id).delete()
  return NextResponse.json({ ok: true })
}


