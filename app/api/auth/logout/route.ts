// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAccessToken } from '@/lib/auth'
import { AuthenticationError } from '@/lib/errors'
import { successResponse } from '@/lib/responses'
import { withAudit } from '@/lib/security'
import { getClientIp } from '@/lib/security'

export const POST = withAudit(async (request: NextRequest) => {
  const accessToken = request.cookies.get('accessToken')?.value
  
  if (!accessToken) {
    return NextResponse.json(
      successResponse('Logged out successfully')
    )
  }

  const decoded = verifyAccessToken(accessToken)
  
  if (decoded) {
    // Delete all active sessions for this user
    await prisma.session.deleteMany({
      where: {
        userId: decoded.userId,
        expiresAt: { gt: new Date() }
      }
    })

    // Log logout action
    // Note: auditLog is called by withAudit wrapper
  }

  const response = NextResponse.json(
    successResponse('Logged out successfully')
  )

  // Clear cookies
  response.cookies.delete('accessToken')
  response.cookies.delete('refreshToken')
  response.cookies.set('accessToken', '', { 
    expires: new Date(0),
    path: '/'
  })
  response.cookies.set('refreshToken', '', { 
    expires: new Date(0),
    path: '/'
  })

  return response
}, 'LOGOUT', 'SESSION')
