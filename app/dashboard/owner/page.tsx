// app/dashboard/owner/page.tsx
'use client'

import { useAuth } from '@/context/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '../layout'

export default function OwnerDashboard() {
  const { user } = useAuth()

  return (
    <ProtectedRoute requiredRole="OWNER">
      <DashboardLayout>
        <div className="p-6">
          <h1 className="text-3xl font-bold">Owner Dashboard</h1>
          <p>Welcome, {user?.name}! You are an owner.</p>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
