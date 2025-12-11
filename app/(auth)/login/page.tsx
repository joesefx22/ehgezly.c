// app/(auth)/login/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, LoginInput } from '@/lib/validators'
import { useAuth } from '@/context/AuthContext'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import Alert from '@/components/ui/Alert'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, isAuthenticated } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.push('/dashboard')
    return null
  }

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true)
    setError('')
    
    try {
      await login(data.email, data.password)
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const redirect = searchParams.get('redirect')
  const expired = searchParams.get('expired')
  const registered = searchParams.get('registered')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-600 mt-2">Sign in to your account</p>
          </div>

          {expired && (
            <Alert 
              type="warning" 
              title="Session Expired" 
              message="Your session has expired. Please sign in again." 
              className="mb-6"
            />
          )}

          {registered && (
            <Alert 
              type="success" 
              title="Registration Successful" 
              message="Your account has been created. Please sign in." 
              className="mb-6"
            />
          )}

          {redirect && (
            <Alert 
              type="info" 
              title="Authentication Required" 
              message="Please sign in to access that page." 
              className="mb-6"
            />
          )}

          {error && (
            <Alert 
              type="error" 
              title="Login Failed" 
              message={error} 
              className="mb-6"
            />
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
              disabled={isLoading}
            />

            <div>
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
                disabled={isLoading}
              />
              <div className="mt-2 text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
              disabled={isLoading}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-600 text-sm">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="text-center text-xs text-gray-500">
              <div className="font-semibold">Player</div>
              <div>🎮 Game Access</div>
            </div>
            <div className="text-center text-xs text-gray-500">
              <div className="font-semibold">Owner</div>
              <div>🏟️ Manage Venues</div>
            </div>
            <div className="text-center text-xs text-gray-500">
              <div className="font-semibold">Admin</div>
              <div>🛡️ Full Control</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
