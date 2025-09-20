import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import CredentialsProvider from 'next-auth/providers/credentials'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import { getUser, createUser, isSuperAdminEmail, UserDocument } from '@/lib/firebase/firestore'
import { adminAuth } from '@/lib/firebase/admin'

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
        // For social logins, always allow sign in and handle user creation in jwt callback
        if (account?.provider === 'google' || account?.provider === 'facebook') {
          return true
        }
        
        // For credentials provider, user should already exist
        if (account?.provider === 'credentials') {
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
          // Check if user exists in Firestore
          const existingUser = await getUser(user.id)
          
          if (existingUser) {
            token.role = existingUser.role
          } else {
            // Create new user in Firestore
            const role = isSuperAdminEmail(user.email || '') ? 'SuperAdmin' : 'User'
            await createUser({
              uid: user.id,
              email: user.email || '',
              role,
              profile: {
                firstName: user.name?.split(' ')[0] || '',
                lastName: user.name?.split(' ').slice(1).join(' ') || '',
                gender: 'Other',
                dateOfBirth: '',
                mobile: '',
                avatar: user.image
              }
            })
            token.role = role
          }
        } catch (error) {
          console.error('Error handling social login:', error)
          // Fallback to default role
          token.role = isSuperAdminEmail(user.email || '') ? 'SuperAdmin' : 'User'
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
