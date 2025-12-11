// lib/security.ts
import { NextRequest, NextResponse } from 'next/server'
import { auditLog } from './logger'

export const securityHeaders = () => {
  const headers: Record<string, string> = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  }

  // Content Security Policy
  if (process.env.NODE_ENV === 'production') {
    headers['Content-Security-Policy'] = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self';
      connect-src 'self' ${process.env.APP_URL};
      frame-ancestors 'none';
      base-uri 'self';
      form-action 'self';
    `.replace(/\s+/g, ' ').trim()
  }

  return headers
}

// CSRF Protection
export const csrfProtection = () => {
  const generateToken = (): string => {
    return crypto.randomBytes(32).toString('hex')
  }

  const verifyToken = (token: string, sessionToken: string): boolean => {
    return token === sessionToken
  }

  return {
    generateToken,
    verifyToken
  }
}

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .trim()
    .slice(0, 1000) // Limit length
}

// Get client IP
export const getClientIp = (req: NextRequest): string => {
  return req.headers.get('x-forwarded-for')?.split(',')[0] || 
         req.headers.get('x-real-ip') || 
         'unknown'
}

// Get user agent
export const getUserAgent = (req: NextRequest): string => {
  return req.headers.get('user-agent') || 'unknown'
}

// Audit middleware
export const withAudit = (
  handler: Function,
  action: string,
  entityType?: string
) => {
  return async (req: NextRequest, ...args: any[]) => {
    const ipAddress = getClientIp(req)
    const userAgent = getUserAgent(req)
    
    try {
      const result = await handler(req, ...args)
      
      // Log successful action
      auditLog(
        'system', // Will be replaced with actual user ID if available
        `${action}_SUCCESS`,
        entityType,
        undefined,
        undefined,
        undefined,
        ipAddress,
        userAgent
      )
      
      return result
    } catch (error: any) {
      // Log failed action
      auditLog(
        'system',
        `${action}_FAILED`,
        entityType,
        undefined,
        undefined,
        { error: error.message },
        ipAddress,
        userAgent
      )
      
      throw error
    }
  }
}
