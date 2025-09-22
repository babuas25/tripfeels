'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { auth } from '@/lib/firebase/config'
import { createUser, isSuperAdminEmail } from '@/lib/firebase/firestore'
import { registrationSchema, signInSchema, type RegistrationFormData, type SignInFormData } from '@/lib/utils/validation'
import { DASHBOARD_ROUTES } from '@/lib/utils/constants'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { useSession } from 'next-auth/react'
import AuthSlideshow from '@/components/auth/AuthSlideshow'

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('signin')
  const router = useRouter()
  const { data: session } = useSession()

  // Sign In Form
  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  })

  // Registration Form
  const registrationForm = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      gender: 'Male',
      dateOfBirth: '',
      mobile: '',
      acceptTerms: false
    }
  })

  const handleSignIn = async (data: SignInFormData) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false
      })

      if (result?.ok) {
        const session = await getSession()
        if (session?.user?.role) {
          const dashboardRoute = DASHBOARD_ROUTES[session.user.role as keyof typeof DASHBOARD_ROUTES]
          router.push(dashboardRoute)
        }
      } else {
        console.error('Sign in failed:', result?.error)
        setError('Invalid email or password. Please try again.')
      }
    } catch (error: any) {
      console.error('Sign in error:', error)
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email. Please register first.')
        setActiveTab('register')
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.')
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address. Please check your email and try again.')
      } else {
        setError('Sign in failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegistration = async (data: RegistrationFormData) => {
    setIsLoading(true)
    setError(null)
    try {
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      )

      const user = userCredential.user
      const role = isSuperAdminEmail(data.email) ? 'SuperAdmin' : 'User'

      // Create user document in Firestore
      await createUser({
        uid: user.uid,
        email: data.email,
        role,
        profile: {
          firstName: data.firstName,
          lastName: data.lastName,
          gender: data.gender,
          dateOfBirth: data.dateOfBirth,
          mobile: data.mobile,
        }
      })

      // Sign in the user
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false
      })

      if (result?.ok) {
        const session = await getSession()
        if (session?.user?.role) {
          const dashboardRoute = DASHBOARD_ROUTES[session.user.role as keyof typeof DASHBOARD_ROUTES]
          router.push(dashboardRoute)
        }
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      
      // Handle specific Firebase errors
      if (error.code === 'auth/email-already-in-use') {
        // Email already exists - redirect to sign in
        setError('This email is already registered. Please sign in instead.')
        setActiveTab('signin')
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak. Please choose a stronger password.')
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address. Please check your email and try again.')
      } else {
        setError('Registration failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialSignIn = async (provider: 'google' | 'facebook') => {
    setIsLoading(true)
    try {
      // Use redirect: true to let NextAuth handle the redirect
      // The middleware will handle role-based routing after authentication
      await signIn(provider, { 
        redirect: true 
      })
    } catch (error) {
      console.error('Social sign in error:', error)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Header showNavigation={false} showUserActions={true} />
      
      {/* Main content with sidebar for logged-in users */}
      <div className="flex pt-14 min-h-[calc(100vh-3.5rem)]">
        {/* Sidebar for logged-in users */}
        {session?.user && (
          <div className="flex">
            <Sidebar />
          </div>
        )}
        
        {/* Main content area */}
        <div className={`${session?.user ? 'flex-1' : 'w-full'} flex`}>
          {/* Left Section - Slideshow (only for non-logged-in users) */}
          {!session?.user && <AuthSlideshow />}

          {/* Right Section - Auth Form */}
          <div className={`${session?.user ? 'w-full' : 'w-full lg:w-1/2'} flex justify-center p-8 bg-background min-h-[calc(100vh-3.5rem)]`}>
          <div className="w-full max-w-md space-y-6 flex flex-col justify-center">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">
                {activeTab === 'signin' ? 'Sign in to your account' : 'Create an account'}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {activeTab === 'signin' 
                  ? 'Enter your email below to sign in to your account'
                  : 'Enter your email below to create your account'
                }
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md dark:bg-red-500/20 dark:border-red-500/30">
                <p className="text-sm text-red-600 dark:text-red-200">{error}</p>
              </div>
            )}

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted">
                <TabsTrigger value="signin" className="data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground">Sign In</TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground">Register</TabsTrigger>
              </TabsList>

              {/* Sign In Tab */}
              <TabsContent value="signin" className="space-y-4">
                <Form {...signInForm}>
                  <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                    <FormField
                      control={signInForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="name@example.com" 
                              className="h-10 bg-background border border-input text-foreground hover:bg-accent hover:text-accent-foreground"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={signInForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Password"
                              className="h-10 bg-background border border-input text-foreground hover:bg-accent hover:text-accent-foreground"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full h-10" disabled={isLoading}>
                      {isLoading ? 'Signing In...' : 'Sign In with Email'}
                    </Button>
                  </form>
                </Form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-3 text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => handleSocialSignIn('google')} 
                    disabled={isLoading}
                    className="h-10 bg-background border border-input text-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Google
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleSocialSignIn('facebook')} 
                    disabled={isLoading}
                    className="h-10 bg-background border border-input text-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <svg className="mr-2 h-4 w-4" fill="#1877F2" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </Button>
                </div>
              </TabsContent>

              {/* Registration Tab */}
              <TabsContent value="register" className="space-y-4">
                <Form {...registrationForm}>
                  <form onSubmit={registrationForm.handleSubmit(handleRegistration)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={registrationForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                placeholder="First name" 
                                className="h-10 bg-background border border-input text-foreground hover:bg-accent hover:text-accent-foreground" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registrationForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                placeholder="Last name" 
                                className="h-10 bg-background border border-input text-foreground hover:bg-accent hover:text-accent-foreground" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={registrationForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="name@example.com" 
                              className="h-10 bg-background border border-input text-foreground hover:bg-accent hover:text-accent-foreground" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registrationForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Password" 
                              className="h-10 bg-background border border-input text-foreground hover:bg-accent hover:text-accent-foreground" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registrationForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Confirm Password" 
                              className="h-10 bg-background border border-input text-foreground hover:bg-accent hover:text-accent-foreground" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={registrationForm.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <select 
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                                {...field}
                              >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registrationForm.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                type="date" 
                                className="h-10 bg-background border border-input text-foreground hover:bg-accent hover:text-accent-foreground" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={registrationForm.control}
                      name="mobile"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              type="tel" 
                              placeholder="Mobile Number" 
                              className="h-10 bg-background border border-input text-foreground hover:bg-accent hover:text-accent-foreground" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registrationForm.control}
                      name="acceptTerms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="mt-1 h-4 w-4 rounded border border-input bg-background text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm text-foreground">
                              I accept the terms and conditions
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full h-10" disabled={isLoading}>
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </form>
                </Form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-3 text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => handleSocialSignIn('google')} 
                    disabled={isLoading}
                    className="h-10 bg-background border border-input text-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Google
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleSocialSignIn('facebook')} 
                    disabled={isLoading}
                    className="h-10 bg-background border border-input text-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <svg className="mr-2 h-4 w-4" fill="#1877F2" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {/* Footer */}
            <p className="text-center text-xs text-muted-foreground">
              By clicking continue, you agree to our{' '}
              <span className="underline underline-offset-4 cursor-pointer hover:text-foreground">
                Terms of Service
              </span>{' '}
              and{' '}
              <span className="underline underline-offset-4 cursor-pointer hover:text-foreground">
                Privacy Policy
              </span>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}
