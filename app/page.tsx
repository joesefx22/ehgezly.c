'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Header from '@/components/layout/Header'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function HomePage() {
  const { isAuthenticated, user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const rolePaths = {
        PLAYER: '/dashboard/player',
        OWNER: '/dashboard/owner',
        EMPLOYEE: '/dashboard/employee',
        ADMIN: '/dashboard/admin'
      }
      
      const redirectPath = rolePaths[user.role as keyof typeof rolePaths] || '/dashboard'
      router.push(redirectPath)
    }
  }, [isAuthenticated, user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to GameZone 🎮
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            The ultimate platform connecting players, stadium owners, and gaming enthusiasts. 
            Join our community and experience gaming like never before.
          </p>
          
          <div className="flex justify-center gap-6">
            <Button
              size="lg"
              onClick={() => router.push('/login')}
              className="px-8"
            >
              Sign In
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push('/register')}
              className="px-8"
            >
              Sign Up
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">🎮</div>
            <h3 className="text-xl font-bold mb-3">For Players</h3>
            <p className="text-gray-600 mb-4">
              Book games, join tournaments, track your stats, and compete with friends
            </p>
            <Button variant="outline" className="w-full">
              Join as Player
            </Button>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">🏟️</div>
            <h3 className="text-xl font-bold mb-3">For Owners</h3>
            <p className="text-gray-600 mb-4">
              Manage your venues, schedules, earnings, and grow your business
            </p>
            <Button variant="outline" className="w-full">
              Register Venue
            </Button>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">👨‍💼</div>
            <h3 className="text-xl font-bold mb-3">For Employees</h3>
            <p className="text-gray-600 mb-4">
              Handle bookings, payments, customer support, and daily operations
            </p>
            <Button variant="outline" className="w-full">
              Join as Staff
            </Button>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="text-xl font-bold mb-3">For Admins</h3>
            <p className="text-gray-600 mb-4">
              Monitor system, manage users, view analytics, and ensure smooth operations
            </p>
            <Button variant="outline" className="w-full">
              System Access
            </Button>
          </Card>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-4">1. Register</div>
              <p className="text-gray-600">
                Choose your role and create your account in minutes
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-4">2. Verify</div>
              <p className="text-gray-600">
                Confirm your email and complete your profile setup
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-4">3. Explore</div>
              <p className="text-gray-600">
                Access your personalized dashboard and start your journey
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-6">Ready to get started?</h3>
          <Button
            size="lg"
            onClick={() => router.push('/register')}
            className="px-12"
          >
            Create Your Free Account
          </Button>
          <p className="text-gray-500 mt-4">
            No credit card required • Free forever for basic features
          </p>
        </div>
      </main>

      <footer className="mt-16 py-8 border-t text-center text-gray-600">
        <p>&copy; {new Date().getFullYear()} GameZone. All rights reserved.</p>
        <p className="mt-2 text-sm">
          Built with Next.js 14, Prisma, and PostgreSQL
        </p>
      </footer>
    </div>
  )
}
