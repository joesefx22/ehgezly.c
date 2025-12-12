'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { toast } from 'react-hot-toast'

interface User {
  id: string
  name: string
  email: string
  role: string
  isVerified: boolean
  isActive: boolean
  lastLogin?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, password: string, confirmPassword: string) => Promise<void>
  updateProfile: (data: UpdateProfileData) => Promise<void>
  changePassword: (data: ChangePasswordData) => Promise<void>
  resendVerification: () => Promise<void>
}

interface RegisterData {
  name: string
  email: string
  password: string
  confirmPassword: string
  role: string
}

interface UpdateProfileData {
  name?: string
  email?: string
}

interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const router = useRouter()
  const pathname = usePathname()

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUser(data.data)
          setIsAuthenticated(true)
        } else {
          setUser(null)
          setIsAuthenticated(false)
        }
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  useEffect(() => {
    if (!isLoading) {
      const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email']
      const isPublicPath = publicPaths.some(path => pathname?.startsWith(path))

      if (isAuthenticated && isPublicPath) {
        const rolePaths = {
          PLAYER: '/dashboard/player',
          OWNER: '/dashboard/owner',
          EMPLOYEE: '/dashboard/employee',
          ADMIN: '/dashboard/admin'
        }
        const redirectPath = rolePaths[user?.role as keyof typeof rolePaths] || '/dashboard'
        router.push(redirectPath)
      } else if (!isAuthenticated && !isPublicPath && pathname !== '/') {
        router.push('/login')
      }
    }
  }, [isLoading, isAuthenticated, user, pathname, router])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message)
      }

      await fetchUser()
      toast.success('Login successful!')

      const role = data.data.user.role
      const rolePaths = {
        PLAYER: '/dashboard/player',
        OWNER: '/dashboard/owner',
        EMPLOYEE: '/dashboard/employee',
        ADMIN: '/dashboard/admin'
      }

      router.push(rolePaths[role as keyof typeof rolePaths] || '/dashboard')

    } catch (error: any) {
      toast.error(error.message || 'Login failed')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterData) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message)
      }

      toast.success('Registration successful! Please check your email.')
      router.push('/login?registered=true')

    } catch (error: any) {
      toast.error(error.message || 'Registration failed')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })

      setUser(null)
      setIsAuthenticated(false)
      toast.success('Logged out successfully')
      router.push('/login')
    } catch (error) {
      toast.error('Logout failed')
    }
  }

  const forgotPassword = async (email: string) => {
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message)
      }

      toast.success('Password reset instructions sent')
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset instructions')
      throw error
    }
  }

  const resetPassword = async (token: string, password: string, confirmPassword: string) => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message)
      }

      toast.success('Password reset successfully')
      router.push('/login')
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password')
      throw error
    }
  }

  const updateProfile = async (data: UpdateProfileData) => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message)
      }

      setUser(result.data)
      toast.success('Profile updated successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile')
      throw error
    }
  }

  const changePassword = async (data: ChangePasswordData) => {
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message)
      }

      toast.success('Password changed successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password')
      throw error
    }
  }

  const resendVerification = async () => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email }),
        credentials: 'include'
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message)
      }

      toast.success('Verification email sent')
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend verification')
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshUser: fetchUser,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
    resendVerification
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
