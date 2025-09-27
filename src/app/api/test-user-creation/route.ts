import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth'
import { adminDb } from '@/lib/firebase/admin'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    console.log('Testing user creation...')
    
    // Test creating a user document
    const testUserId = 'test-user-' + Date.now()
    const now = new Date()
    
    const testUserData = {
      uid: testUserId,
      email: 'test@example.com',
      role: 'User',
      category: '',
      profile: {
        firstName: 'Test',
        lastName: 'User',
        gender: 'Other',
        dateOfBirth: '',
        mobile: '',
        avatar: ''
      },
      metadata: {
        createdAt: now,
        lastLoginAt: now,
        isActive: true,
        emailVerified: false
      },
      permissions: [],
      assignedBy: ''
    }
    
    console.log('Creating test user:', testUserData)
    await adminDb.collection('users').doc(testUserId).set(testUserData)
    
    // Verify the user was created
    const createdUser = await adminDb.collection('users').doc(testUserId).get()
    
    if (createdUser.exists) {
      console.log('Test user created successfully')
      // Clean up the test user
      await adminDb.collection('users').doc(testUserId).delete()
      console.log('Test user cleaned up')
      
      return NextResponse.json({ 
        success: true,
        message: 'User creation test passed',
        testUserData: createdUser.data()
      })
    } else {
      return NextResponse.json({ 
        success: false,
        message: 'Test user was not created'
      })
    }
  } catch (error) {
    console.error('Test user creation error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
