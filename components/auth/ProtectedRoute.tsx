// components/auth/ProtectedRoute.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
  redirectTo?: string
}

export default function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Not authenticated, redirect to login
        router.push(redirectTo)
      } else if (requiredRole && user?.role !== requiredRole) {
        // Wrong role, redirect to appropriate dashboard
        const rolePaths = {
          PLAYER: '/dashboard/player',
          OWNER: '/dashboard/owner',
          EMPLOYEE: '/dashboard/employee',
          ADMIN: '/dashboard/admin'
        }
        const redirectPath = rolePaths[user?.role as keyof typeof rolePaths] || '/dashboard'
        router.push(redirectPath)
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRole, router, redirectTo])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
    return null
  }

  return <>{children}</>
}
