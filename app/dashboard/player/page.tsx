// app/dashboard/player/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/app/dashboard/layout'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function PlayerDashboard() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <ProtectedRoute requiredRole="PLAYER">
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {user?.name}!
              </h1>
              <p className="text-gray-600 mt-2">
                Player Dashboard • {user?.email}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => logout()}
            >
              Sign Out
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="text-4xl mb-2">🎮</div>
              <h3 className="font-bold text-lg mb-2">Active Games</h3>
              <p className="text-gray-600">Join or create new games</p>
              <Button className="mt-4 w-full" variant="outline">
                View Games
              </Button>
            </Card>

            <Card className="p-6">
              <div className="text-4xl mb-2">🏆</div>
              <h3 className="font-bold text-lg mb-2">Tournaments</h3>
              <p className="text-gray-600">Compete in tournaments</p>
              <Button className="mt-4 w-full" variant="outline">
                Browse Tournaments
              </Button>
            </Card>

            <Card className="p-6">
              <div className="text-4xl mb-2">📊</div>
              <h3 className="font-bold text-lg mb-2">Statistics</h3>
              <p className="text-gray-600">Track your performance</p>
              <Button className="mt-4 w-full" variant="outline">
                View Stats
              </Button>
            </Card>
          </div>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">Game Completed</div>
                  <div className="text-sm text-gray-500">Just now</div>
                </div>
                <div className="text-green-600 font-medium">+50 points</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">Tournament Joined</div>
                  <div className="text-sm text-gray-500">2 hours ago</div>
                </div>
                <div className="text-blue-600 font-medium">Weekly Cup</div>
              </div>
            </div>
          </Card>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-bold text-lg text-blue-800 mb-2">
              Account Status
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-blue-700">
                  <span className="font-medium">Email:</span> {user?.isVerified ? '✅ Verified' : '❌ Not Verified'}
                </div>
                <div className="text-blue-700">
                  <span className="font-medium">Member since:</span>{' '}
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>
              <div className="px-4 py-2 bg-white rounded border">
                <div className="text-sm text-gray-500">Role</div>
                <div className="font-bold text-blue-600">{user?.role}</div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
