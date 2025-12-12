// app/(auth)/register/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, RegisterInput } from '@/lib/validators'
import { useAuth } from '@/context/AuthContext'
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Calendar,
  Star,
  FileText,
  ShieldCheck
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import Alert from '@/components/ui/Alert'

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [skillLevel, setSkillLevel] = useState('AVERAGE')
  const { register: registerUser, isAuthenticated } = useAuth()
  const router = useRouter()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
      age: undefined,
      description: '',
      skillLevel: 'AVERAGE'
    }
  })

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.push('/dashboard')
    return null
  }

  const password = watch('password')
  const age = watch('age')

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true)
    setError('')
    
    try {
      await registerUser(data)
    } catch (err: any) {
      setError(err.message || 'فشل في التسجيل')
    } finally {
      setIsLoading(false)
    }
  }

  const skillLevels = [
    { value: 'WEAK', label: 'ضعيف', color: 'from-gray-400 to-gray-500', icon: '😅' },
    { value: 'AVERAGE', label: 'متوسط', color: 'from-blue-400 to-blue-500', icon: '😊' },
    { value: 'GOOD', label: 'جيد', color: 'from-green-400 to-green-500', icon: '😎' },
    { value: 'EXCELLENT', label: 'ممتاز', color: 'from-purple-400 to-purple-500', icon: '🔥' },
    { value: 'LEGENDARY', label: 'أسطوري', color: 'from-orange-400 to-orange-500', icon: '👑' }
  ]

  const passwordChecks = [
    { label: '8 أحرف على الأقل', check: password?.length >= 8 },
    { label: 'حرف كبير (A-Z)', check: /[A-Z]/.test(password || '') },
    { label: 'حرف صغير (a-z)', check: /[a-z]/.test(password || '') },
    { label: 'رقم (0-9)', check: /[0-9]/.test(password || '') },
    { label: 'رمز خاص (!@#$)', check: /[^A-Za-z0-9]/.test(password || '') }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Side - Welcome */}
          <div className="flex flex-col justify-center text-white p-8">
            <div className="mb-10">
              <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                أنشئ حسابك
              </h1>
              <p className="text-xl text-gray-300 mb-6">
                انضم إلى مجتمعنا وابدأ رحلتك في عالم الألعاب
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <ShieldCheck className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">حماية وأمان</h3>
                  <p className="text-gray-400">بياناتك مشفرة وآمنة تماماً</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <Star className="w-8 h-8 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">تقييم مهاراتك</h3>
                  <p className="text-gray-400">اختر مستوى مهارتك واحصل على تحديات مناسبة</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <User className="w-8 h-8 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">ملف شخصي متكامل</h3>
                  <p className="text-gray-400">أنشئ ملفاً شخصياً يعبر عنك</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <Card className="p-8 bg-white/10 backdrop-blur-lg border border-white/20">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white">تسجيل جديد</h2>
              <p className="text-gray-300 mt-2">املأ البيانات لإنشاء حسابك</p>
            </div>

            {error && (
              <Alert 
                type="error" 
                title="خطأ في التسجيل" 
                message={error} 
                className="mb-6"
              />
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <div className="absolute right-3 top-3 text-gray-400">
                    <User className="w-5 h-5" />
                  </div>
                  <Input
                    label="الاسم الكامل"
                    type="text"
                    placeholder="أحمد محمد"
                    error={errors.name?.message}
                    {...register('name')}
                    disabled={isLoading}
                    className="bg-white/5 border-white/20 text-white pr-10"
                  />
                </div>

                <div className="relative">
                  <div className="absolute right-3 top-3 text-gray-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <Input
                    label="البريد الإلكتروني"
                    type="email"
                    placeholder="ahmed@example.com"
                    error={errors.email?.message}
                    {...register('email')}
                    disabled={isLoading}
                    className="bg-white/5 border-white/20 text-white pr-10"
                  />
                </div>

                <div className="relative">
                  <div className="absolute right-3 top-3 text-gray-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <Input
                    label="رقم الهاتف"
                    type="tel"
                    placeholder="+20 100 000 0000"
                    error={errors.phoneNumber?.message}
                    {...register('phoneNumber')}
                    disabled={isLoading}
                    className="bg-white/5 border-white/20 text-white pr-10"
                  />
                </div>

                <div className="relative">
                  <div className="absolute right-3 top-3 text-gray-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <Input
                    label="العمر"
                    type="number"
                    placeholder="25"
                    min="13"
                    max="100"
                    error={errors.age?.message}
                    {...register('age', { valueAsNumber: true })}
                    disabled={isLoading}
                    className="bg-white/5 border-white/20 text-white pr-10"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <div className="absolute right-3 top-3 text-gray-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <Input
                    label="كلمة المرور"
                    type="password"
                    placeholder="••••••••"
                    error={errors.password?.message}
                    {...register('password')}
                    disabled={isLoading}
                    className="bg-white/5 border-white/20 text-white pr-10"
                  />
                </div>

                <div className="relative">
                  <div className="absolute right-3 top-3 text-gray-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <Input
                    label="تأكيد كلمة المرور"
                    type="password"
                    placeholder="••••••••"
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword')}
                    disabled={isLoading}
                    className="bg-white/5 border-white/20 text-white pr-10"
                  />
                </div>
              </div>

              {/* Password Requirements */}
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  متطلبات كلمة المرور
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {passwordChecks.map((check, index) => (
                    <div 
                      key={index}
                      className={`text-xs p-2 rounded-lg text-center ${
                        check.check 
                          ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                          : 'bg-red-500/10 text-red-300 border border-red-500/20'
                      }`}
                    >
                      {check.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Skill Level */}
              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  <Star className="w-4 h-4 inline ml-1" />
                  مستوى المهارة
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {skillLevels.map((level) => (
                    <button
                      type="button"
                      key={level.value}
                      onClick={() => {
                        setSkillLevel(level.value)
                        setValue('skillLevel', level.value)
                      }}
                      className={`
                        relative flex flex-col items-center p-3 rounded-xl border-2
                        transition-all duration-300 transform hover:scale-105
                        ${skillLevel === level.value 
                          ? `border-white bg-gradient-to-br ${level.color} shadow-lg` 
                          : 'border-white/20 bg-white/5 hover:bg-white/10'
                        }
                      `}
                    >
                      <div className="text-2xl mb-1">{level.icon}</div>
                      <div className="text-xs font-medium text-white">{level.label}</div>
                    </button>
                  ))}
                </div>
                {errors.skillLevel?.message && (
                  <p className="text-sm text-red-400 mt-2">{errors.skillLevel.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  <FileText className="w-4 h-4 inline ml-1" />
                  الوصف الشخصي (اختياري)
                </label>
                <textarea
                  placeholder="أخبرنا عن نفسك، هواياتك، ومهاراتك..."
                  rows={3}
                  maxLength={500}
                  {...register('description')}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl
                           text-white placeholder-gray-400 focus:outline-none 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           transition-all resize-none"
                />
                <div className="text-xs text-gray-400 mt-1 text-left">
                  {watch('description')?.length || 0}/500 حرف
                </div>
              </div>

              {/* Terms */}
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="terms"
                    className="mt-1 ml-3 w-4 h-4"
                    required
                  />
                  <label htmlFor="terms" className="text-sm text-gray-300">
                    أوافق على{' '}
                    <Link href="/terms" className="text-blue-400 hover:text-blue-300 underline">
                      شروط الخدمة
                    </Link>{' '}
                    و{' '}
                    <Link href="/privacy" className="text-blue-400 hover:text-blue-300 underline">
                      سياسة الخصوصية
                    </Link>
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500
                         hover:from-blue-600 hover:to-purple-600 text-white font-semibold
                         rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/20">
              <p className="text-center text-gray-300 text-sm">
                لديك حساب بالفعل؟{' '}
                <Link
                  href="/login"
                  className="font-medium text-blue-400 hover:text-blue-300 underline"
                >
                  تسجيل الدخول
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
