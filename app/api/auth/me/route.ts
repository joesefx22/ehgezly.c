// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAccessToken } from '@/lib/auth'
import { AuthenticationError } from '@/lib/errors'
import { successResponse, errorResponse } from '@/lib/responses'
import { updateProfileSchema } from '@/lib/validators'
import { withAudit } from '@/lib/security'

export const GET = withAudit(async (request: NextRequest) => {
  const accessToken = request.cookies.get('accessToken')?.value
  
  if (!accessToken) {
    return NextResponse.json(
      errorResponse('Not authenticated', 'AUTHENTICATION_ERROR'),
      { status: 401 }
    )
  }

  const decoded = verifyAccessToken(accessToken)
  
  if (!decoded) {
    return NextResponse.json(
      errorResponse('Invalid token', 'INVALID_TOKEN'),
      { status: 401 }
    )
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isVerified: true,
      isActive: true,
      lastLogin: true,
      createdAt: true,
      updatedAt: true
    }
  })

  if (!user) {
    return NextResponse.json(
      errorResponse('User not found', 'NOT_FOUND'),
      { status: 404 }
    )
  }

  return NextResponse.json(
    successResponse('User data retrieved', user)
  )
}, 'GET_USER_INFO', 'USER')

export const PUT = withAudit(async (request: NextRequest) => {
  const accessToken = request.cookies.get('accessToken')?.value
  
  if (!accessToken) {
    return NextResponse.json(
      errorResponse('Not authenticated', 'AUTHENTICATION_ERROR'),
      { status: 401 }
    )
  }

  const decoded = verifyAccessToken(accessToken)
  
  if (!decoded) {
    return NextResponse.json(
      errorResponse('Invalid token', 'INVALID_TOKEN'),
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)

    // Check if email is being changed and if it's already taken
    if (validatedData.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: validatedData.email,
          NOT: { id: decoded.userId }
        }
      })

      if (existingUser) {
        return NextResponse.json(
          errorResponse('Email already in use', 'CONFLICT'),
          { status: 409 }
        )
      }
    }

    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: validatedData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json(
      successResponse('Profile updated successfully', user)
    )

  } catch (error: any) {
    return NextResponse.json(
      errorResponse(
        error.message || 'Update failed',
        'VALIDATION_ERROR',
        error.errors
      ),
      { status: 400 }
    )
  }
}, 'UPDATE_PROFILE', 'USER')
