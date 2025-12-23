// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { successResponse } from '@/lib/responses'
import { withAudit } from '@/lib/security'
import { getClientIp } from '@/lib/security'

export const POST = withAudit(async (request: NextRequest) => {
  // ✅ Response
  const response = NextResponse.json(
    successResponse('تم تسجيل الخروج بنجاح')
  )

  // ✅ Clear cookies (even لو مش مستخدمين tokens)
  response.cookies.set('accessToken', '', { 
    expires: new Date(0),
    path: '/'
  })

  response.cookies.set('refreshToken', '', { 
    expires: new Date(0),
    path: '/'
  })

  return response
}, 'LOGOUT', 'USER')
