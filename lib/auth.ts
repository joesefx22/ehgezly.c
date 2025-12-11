// lib/auth.ts
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET!
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!
const ACCESS_TOKEN_EXPIRY = '15m'
const REFRESH_TOKEN_EXPIRY = '7d'

// Hashing
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(12)
  return await bcrypt.hash(password, salt)
}

export const comparePassword = async (
  password: string, 
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword)
}

// Password Strength Check
export const validatePasswordStrength = (password: string): {
  isValid: boolean
  errors: string[]
} => {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Tokens
export const generateAccessToken = (userId: string, role: string): string => {
  return jwt.sign(
    { 
      userId, 
      role,
      type: 'access'
    }, 
    JWT_SECRET, 
    { 
      expiresIn: ACCESS_TOKEN_EXPIRY,
      issuer: 'auth-system',
      audience: 'user'
    }
  )
}

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    { 
      userId,
      type: 'refresh' 
    }, 
    JWT_REFRESH_SECRET, 
    { 
      expiresIn: REFRESH_TOKEN_EXPIRY,
      issuer: 'auth-system',
      audience: 'user'
    }
  )
}

export const verifyAccessToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'auth-system',
      audience: 'user'
    })
  } catch (error) {
    return null
  }
}

export const verifyRefreshToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'auth-system',
      audience: 'user'
    })
  } catch (error) {
    return null
  }
}

// Generate random tokens for email verification/password reset
export const generateSecureToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex')
}

// Generate token expiry (default 24 hours)
export const getTokenExpiry = (hours: number = 24): Date => {
  const now = new Date()
  now.setHours(now.getHours() + hours)
  return now
}

// Check if account is locked
export const isAccountLocked = (lockedUntil: Date | null): boolean => {
  if (!lockedUntil) return false
  return new Date() < lockedUntil
}

// Increment login attempts
export const incrementLoginAttempts = async (
  userId: string, 
  maxAttempts: number = 5, 
  lockTimeMinutes: number = 15
): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!user) return

  const newAttempts = user.loginAttempts + 1
  let lockedUntil = null

  if (newAttempts >= maxAttempts) {
    lockedUntil = new Date()
    lockedUntil.setMinutes(lockedUntil.getMinutes() + lockTimeMinutes)
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      loginAttempts: newAttempts,
      lockedUntil
    }
  })
}

// Reset login attempts on successful login
export const resetLoginAttempts = async (userId: string): Promise<void> => {
  await prisma.user.update({
    where: { id: userId },
    data: {
      loginAttempts: 0,
      lockedUntil: null
    }
  })
}
