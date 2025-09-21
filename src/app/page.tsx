import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { AuthSessionProvider } from '@/components/providers/session-provider'

export default function HomePage() {
  return (
    <AuthSessionProvider>
      <div className="min-h-screen">
        <Header showNavigation={false} showUserActions={true} />
        
        {/* Main content with sidebar for logged-in users */}
        <div className="flex pt-14">
          <div className="h-[calc(100vh-3.5rem)] flex">
            <Sidebar />
          </div>
          <main className="flex-1 overflow-auto p-6">
            {/* Your page content goes here */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Welcome to TripFeels</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Your personalized dashboard and travel management platform.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Dashboard</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Access your personalized dashboard with all your travel information.
                  </p>
                </div>
                
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Travel Plans</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Manage your travel itineraries and bookings in one place.
                  </p>
                </div>
                
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Profile</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Update your profile information and preferences.
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </AuthSessionProvider>
  )
}
