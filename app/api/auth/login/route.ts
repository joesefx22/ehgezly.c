import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { comparePassword } from '@/lib/auth'
import { loginSchema } from '@/lib/validators'
import { rateLimiter } from '@/lib/rate-limit'
import { handleError, AuthenticationError } from '@/lib/errors'
import { successResponse, errorResponse } from '@/lib/responses'
import { getClientIp, withAudit } from '@/lib/security'
import { auditLog } from '@/lib/logger'

export const POST = withAudit(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const validatedData = loginSchema.parse(body)

    await rateLimiter.checkForAuth(request, validatedData.email)

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (!user) {
      throw new AuthenticationError('البريد الإلكتروني أو كلمة المرور غير صحيحة')
    }

    if (!user.isActive) {
      throw new AuthenticationError('الحساب غير نشط')
    }

    const isPasswordValid = await comparePassword(
      validatedData.password,
      user.password
    )

    if (!isPasswordValid) {
      throw new AuthenticationError('البريد الإلكتروني أو كلمة المرور غير صحيحة')
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date(), updatedAt: new Date() }
    })

    const response = NextResponse.json(
      successResponse('تم تسجيل الدخول بنجاح', {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          age: user.age,
          description: user.description,
          skillLevel: user.skillLevel,
          role: user.role,
          lastLogin: user.lastLogin
        }
      })
    )

    // ✅ Save userId in cookie (بديل accessToken)
    response.cookies.set('userId', String(user.id), {
      httpOnly: true,
      sameSite: 'strict',
      path: '/'
    })

    // ✅ Save userRole in cookie (needed for middleware)
    response.cookies.set('userRole', user.role, {
      httpOnly: false,
      sameSite: 'strict',
      path: '/'
    })

    auditLog(
      user.id,
      'LOGIN',
      'USER',
      user.id,
      null,
      { method: 'email_password' },
      getClientIp(request),
      request.headers.get('user-agent') || undefined
    )

    return response

  } catch (error: any) {
    const appError = handleError(error)

    auditLog(
      null,
      'LOGIN_FAILED',
      'USER',
      undefined,
      null,
      { error: appError.message },
      getClientIp(request),
      request.headers.get('user-agent') || undefined
    )

    return NextResponse.json(
      errorResponse(
        appError.message,
        appError.errorCode,
        appError.details,
        request.nextUrl.pathname
      ),
      { status: appError.statusCode }
    )
  }
}, 'LOGIN', 'USER')
