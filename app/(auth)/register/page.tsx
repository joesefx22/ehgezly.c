// app/(auth)/register/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, RegisterInput } from '@/lib/validators'
import { useAuth } from '@/context/AuthContext'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import Alert from '@/components/ui/Alert'

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { register: registerUser, isAuthenticated } = useAuth()
  const router = useRouter()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'PLAYER'
    }
  })

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.push('/dashboard')
    return null
  }

  const password = watch('password')

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true)
    setError('')
    
    try {
      await registerUser(data)
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-600 mt-2">Choose your role and start your journey</p>
          </div>

          {error && (
            <Alert 
              type="error" 
              title="Registration Failed" 
              message={error} 
              className="mb-6"
            />
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                type="text"
                placeholder="John Doe"
                error={errors.name?.message}
                {...register('name')}
                disabled={isLoading}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register('email')}
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
                disabled={isLoading}
                helperText="Min. 8 chars with uppercase, lowercase, number & special char"
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am a:
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { value: 'PLAYER', label: '🎮 Player', desc: 'Play games & tournaments' },
                  { value: 'OWNER', label: '🏟️ Owner', desc: 'Manage stadiums & earnings' },
                  { value: 'EMPLOYEE', label: '👨‍💼 Employee', desc: 'Handle bookings & support' },
                  { value: 'ADMIN', label: '🛡️ Admin', desc: 'System administration' }
                ].map((role) => (
                  <label
                    key={role.value}
                    className={`
                      relative flex flex-col p-4 border-2 rounded-lg cursor-pointer
                      transition-all hover:border-blue-500 hover:bg-blue-50
                      ${watch('role') === role.value 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      value={role.value}
                      className="sr-only"
                      {...register('role')}
                      disabled={isLoading}
                    />
                    <div className="text-lg mb-2">{role.label.split(' ')[0]}</div>
                    <div className="text-sm font-medium">{role.label.split(' ')[1]}</div>
                    <div className="text-xs text-gray-500 mt-1">{role.desc}</div>
                  </label>
                ))}
              </div>
              {errors.role?.message && (
                <p className="text-sm text-red-600 mt-2">{errors.role.message}</p>
              )}
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">Password Requirements:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li className={`flex items-center ${password?.length >= 8 ? 'text-green-600' : ''}`}>
                  <span className="mr-2">•</span>
                  At least 8 characters long
                </li>
                <li className={`flex items-center ${/[A-Z]/.test(password || '') ? 'text-green-600' : ''}`}>
                  <span className="mr-2">•</span>
                  One uppercase letter (A-Z)
                </li>
                <li className={`flex items-center ${/[a-z]/.test(password || '') ? 'text-green-600' : ''}`}>
                  <span className="mr-2">•</span>
                  One lowercase letter (a-z)
                </li>
                <li className={`flex items-center ${/[0-9]/.test(password || '') ? 'text-green-600' : ''}`}>
                  <span className="mr-2">•</span>
                  One number (0-9)
                </li>
                <li className={`flex items-center ${/[^A-Za-z0-9]/.test(password || '') ? 'text-green-600' : ''}`}>
                  <span className="mr-2">•</span>
                  One special character (!@#$% etc.)
                </li>
              </ul>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 mr-3"
                  required
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the{' '}
                  <Link href="/terms" className="text-blue-600 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
              disabled={isLoading}
            >
              Create Account
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-600 text-sm">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
