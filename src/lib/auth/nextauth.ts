import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import CredentialsProvider from 'next-auth/providers/credentials'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import { isSuperAdminEmail } from '@/lib/firebase/firestore'
import { adminAuth, adminDb } from '@/lib/firebase/admin'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const userCredential = await signInWithEmailAndPassword(
            auth,
            credentials.email,
            credentials.password
          )
          
          const user = userCredential.user
          const userData = await getUser(user.uid)
          
          if (userData) {
            return {
              id: user.uid,
              email: user.email || '',
              name: `${userData.profile.firstName} ${userData.profile.lastName}`,
              image: userData.profile.avatar,
              role: userData.role,
            }
          }
          
          return null
        } catch (error) {
          console.error('Authentication error:', error)
          return null
        }
      }
    })
  ],
  
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false

      try {
        console.log('Sign in attempt:', { 
          email: user.email, 
          provider: account?.provider,
          userId: user.id 
        })
        
        // For social logins, always allow sign in and handle user creation in jwt callback
        if (account?.provider === 'google' || account?.provider === 'facebook') {
          console.log('Social login detected:', account.provider)
          return true
        }
        
        // For credentials provider, user should already exist
        if (account?.provider === 'credentials') {
          console.log('Credentials login detected')
          return true
        }
        
        return true
      } catch (error) {
        console.error('Sign in error:', error)
        return true // Allow sign in and handle errors in jwt callback
      }
    },
    
    async jwt({ token, user, account }) {
      // Set role from user object for credentials login
      if (user && account?.provider === 'credentials') {
        token.role = (user as any).role
        return token
      }
      
    // Handle social logins - create user in Firestore if needed and assign role
    if (user && account && (account.provider === 'google' || account.provider === 'facebook')) {
      try {
        console.log('Processing social login for user:', user.id, user.email)
        
        // Check if user exists in Firestore using Admin SDK
        const userDoc = await adminDb.collection('users').doc(user.id).get()
        
        if (userDoc.exists) {
          console.log('User exists in Firestore, updating last login')
          const userData = userDoc.data()
          // Update last login time for existing user
          await adminDb.collection('users').doc(user.id).update({
            'metadata.lastLoginAt': new Date()
          })
          token.role = userData?.role || 'User'
          console.log('User role from Firestore:', token.role)
        } else {
          console.log('User not found in Firestore, creating new user')
          // Create new user in Firestore using Admin SDK
          const role = isSuperAdminEmail(user.email || '') ? 'SuperAdmin' : 'User'
          const now = new Date()
          
          const userData = {
            uid: user.id,
            email: user.email || '',
            role,
            category: role === 'SuperAdmin' ? 'Admin' : '',
            profile: {
              firstName: user.name?.split(' ')[0] || '',
              lastName: user.name?.split(' ').slice(1).join(' ') || '',
              gender: 'Other',
              dateOfBirth: '',
              mobile: '',
              avatar: user.image || ''
            },
            metadata: {
              createdAt: now,
              lastLoginAt: now,
              isActive: true,
              emailVerified: true
            },
            permissions: [],
            assignedBy: ''
          }
          
          console.log('Creating new user in Firestore:', userData)
          await adminDb.collection('users').doc(user.id).set(userData)
          token.role = role
          console.log('New user created with role:', role)
        }
      } catch (error) {
        console.error('Error handling social login:', error)
        // Fallback to default role
        token.role = isSuperAdminEmail(user.email || '') ? 'SuperAdmin' : 'User'
        console.log('Fallback role assigned:', token.role)
      }
      return token
    }
      
      // For existing tokens, preserve the role
      if (!user && token.role) {
        return token
      }
      
      // Default fallback
      if (!token.role) {
        token.role = 'User'
      }
      
      return token
    },
    
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      
      return session
    },
    
    async redirect({ url, baseUrl }) {
      // Handle post-login redirects
      if (url.startsWith('/')) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      
      // Default redirect to home page - middleware will handle role-based routing
      return baseUrl
    },
  },
  
  pages: {
    signIn: '/auth',
    error: '/auth',
  },
  
  session: {
    strategy: 'jwt',
  },
  
  secret: process.env.NEXTAUTH_SECRET,
}
