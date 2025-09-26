import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'

export async function GET() {
  try {
    // Test Firebase Admin connection
    const testDoc = await adminDb.collection('_test').doc('connection').get()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Firebase Admin connection successful',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Firebase Admin test failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}
