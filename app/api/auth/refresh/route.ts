// app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { 
  verifyRefreshToken, 
  generateAccessToken,
  generateRefreshToken 
} from '@/lib/auth'
import { TokenExpiredError, InvalidTokenError } from '@/lib/errors'
import { successResponse, errorResponse } from '@/lib/responses'
import { withAudit } from '@/lib/security'

export const POST = withAudit(async (request: NextRequest) => {
  const refreshToken = request.cookies.get('refreshToken')?.value
  
  if (!refreshToken) {
    return NextResponse.json(
      errorResponse('Refresh token required', 'TOKEN_REQUIRED'),
      { status: 401 }
    )
  }

  // Verify refresh token
  const decoded = verifyRefreshToken(refreshToken)
  
  if (!decoded) {
    throw new InvalidTokenError('Invalid refresh token')
  }

  // Check if token exists in database and is not expired
  const session = await prisma.session.findFirst({
    where: {
      token: refreshToken,
      expiresAt: { gt: new Date() },
      userId: decoded.userId
    },
    include: {
      user: true
    }
  })

  if (!session) {
    throw new TokenExpiredError('Refresh token expired or invalid')
  }

  // Generate new tokens
  const newAccessToken = generateAccessToken(session.user.id, session.user.role)
  const newRefreshToken = generateRefreshToken(session.user.id)

  // Update session with new refresh token
  await prisma.session.update({
    where: { id: session.id },
    data: {
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }
  })

  const response = NextResponse.json(
    successResponse('Token refreshed successfully')
  )

  // Set new cookies
  response.cookies.set('accessToken', newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60, // 15 minutes
    path: '/'
  })

  response.cookies.set('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/'
  })

  return response
}, 'REFRESH_TOKEN', 'SESSION')
