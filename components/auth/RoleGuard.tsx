// components/auth/RoleGuard.tsx
'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

interface RoleGuardProps {
  children: ReactNode
  allowedRoles: string[]
  fallback?: ReactNode
}

export default function RoleGuard({
  children,
  allowedRoles,
  fallback = null
}: RoleGuardProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
