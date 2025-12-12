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
  ShieldCheck,
  Check,
  X
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
  const description = watch('description')

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
    { value: 'WEAK', label: 'ضعيف', color: 'from-gray-400 to-gray-500', icon: '😅', desc: 'مبتدئ' },
    { value: 'AVERAGE', label: 'متوسط', color: 'from-blue-400 to-blue-500', icon: '😊', desc: 'لديه خبرة' },
    { value: 'GOOD', label: 'جيد', color: 'from-green-400 to-green-500', icon: '😎', desc: 'متمكن' },
    { value: 'EXCELLENT', label: 'ممتاز', color: 'from-purple-400 to-purple-500', icon: '🔥', desc: 'محترف' },
    { value: 'LEGENDARY', label: 'أسطوري', color: 'from-orange-400 to-orange-500', icon: '👑', desc: 'خبير' }
  ]

  const passwordChecks = [
    { label: '8 أحرف على الأقل', check: password?.length >= 8 },
    { label: 'حرف كبير (A-Z)', check: /[A-Z]/.test(password || '') },
    { label: 'حرف صغير (a-z)', check: /[a-z]/.test(password || '') },
    { label: 'رقم (0-9)', check: /[0-9]/.test(password || '') },
    { label: 'رمز خاص (!@#$)', check: /[^A-Za-z0-9]/.test(password || '') }
  ]

  const passwordStrength = passwordChecks.filter(check => check.check).length
  const strengthColor = passwordStrength <= 2 ? 'red' : passwordStrength <= 3 ? 'yellow' : 'green'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Side - Welcome */}
          <div className="flex flex-col justify-center text-white p-8">
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl">
                  <ShieldCheck className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                  أنشئ حسابك
                </h1>
              </div>
              <p className="text-xl text-gray-300 mb-6">
                انضم إلى مجتمعنا وابدأ رحلتك في عالم الألعاب
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4 bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <ShieldCheck className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">حماية وأمان</h3>
                  <p className="text-gray-400">بياناتك مشفرة وآمنة تماماً</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <Star className="w-8 h-8 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">تقييم مهاراتك</h3>
                  <p className="text-gray-400">اختر مستوى مهارتك واحصل على تحديات مناسبة</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <User className="w-8 h-8 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">ملف شخصي متكامل</h3>
                  <p className="text-gray-400">أنشئ ملفاً شخصياً يعبر عنك</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="p-8 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl">
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
                <Input
                  label="الاسم الكامل"
                  type="text"
                  placeholder="أحمد محمد"
                  error={errors.name?.message}
                  icon={<User className="w-5 h-5" />}
                  {...register('name')}
                  disabled={isLoading}
                />

                <Input
                  label="البريد الإلكتروني"
                  type="email"
                  placeholder="ahmed@example.com"
                  error={errors.email?.message}
                  icon={<Mail className="w-5 h-5" />}
                  {...register('email')}
                  disabled={isLoading}
                />

                <Input
                  label="رقم الهاتف"
                  type="tel"
                  placeholder="+20 100 000 0000"
                  error={errors.phoneNumber?.message}
                  icon={<Phone className="w-5 h-5" />}
                  {...register('phoneNumber')}
                  disabled={isLoading}
                />

                <Input
                  label="العمر"
                  type="number"
                  placeholder="25"
                  min="13"
                  max="100"
                  error={errors.age?.message}
                  icon={<Calendar className="w-5 h-5" />}
                  {...register('age', { valueAsNumber: true })}
                  disabled={isLoading}
                />
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="كلمة المرور"
                  type="password"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  icon={<Lock className="w-5 h-5" />}
                  {...register('password')}
                  disabled={isLoading}
                />

                <Input
                  label="تأكيد كلمة المرور"
                  type="password"
                  placeholder="••••••••"
                  error={errors.confirmPassword?.message}
                  icon={<Lock className="w-5 h-5" />}
                  {...register('confirmPassword')}
                  disabled={isLoading}
                />
              </div>

              {/* Password Requirements */}
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    قوة كلمة المرور
                  </h4>
                  <div className="flex items-center gap-2">
                    <div className={`w-24 h-2 rounded-full bg-gray-700 overflow-hidden`}>
                      <div 
                        className={`h-full transition-all duration-300 ${
                          strengthColor === 'red' ? 'bg-red-500 w-2/5' :
                          strengthColor === 'yellow' ? 'bg-yellow-500 w-3/5' :
                          'bg-green-500 w-full'
                        }`}
                      />
                    </div>
                    <span className={`text-xs font-medium ${
                      strengthColor === 'red' ? 'text-red-400' :
                      strengthColor === 'yellow' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {passwordStrength}/5
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {passwordChecks.map((check, index) => (
                    <div 
                      key={index}
                      className={`flex items-center gap-2 text-xs p-2 rounded-lg ${
                        check.check 
                          ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                          : 'bg-red-500/10 text-red-300 border border-red-500/20'
                      }`}
                    >
                      {check.check ? (
                        <Check className="w-3 h-3 text-green-400" />
                      ) : (
                        <X className="w-3 h-3 text-red-400" />
                      )}
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
                          ? `border-white bg-gradient-to-br ${level.color} shadow-lg scale-105` 
                          : 'border-white/20 bg-white/5 hover:bg-white/10'
                        }
                      `}
                    >
                      <div className="text-2xl mb-1">{level.icon}</div>
                      <div className="text-xs font-medium text-white">{level.label}</div>
                      <div className="text-[10px] text-white/70 mt-1">{level.desc}</div>
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
                <div className="flex justify-between mt-1">
                  <div className="text-xs text-gray-400">
                    {description?.length || 0}/500 حرف
                  </div>
                  <div className={`text-xs ${
                    (description?.length || 0) >= 450 ? 'text-orange-400' : 'text-gray-400'
                  }`}>
                    {description?.length || 0 >= 450 ? 'اقتربت من الحد الأقصى' : ''}
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="terms"
                    className="mt-1 ml-3 w-4 h-4 rounded border-white/30 bg-white/10 
                             text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
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
                         rounded-xl shadow-lg hover:shadow-xl transition-all duration-300
                         transform hover:-translate-y-0.5 active:translate-y-0"
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
                  className="font-medium text-blue-400 hover:text-blue-300 underline hover:no-underline transition-all"
                >
                  تسجيل الدخول
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
