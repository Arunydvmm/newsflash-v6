// @ts-nocheck
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production'
export const AUTH_COOKIE    = 'nf_token'
export const EMP_AUTH_COOKIE = 'nf_emp_token'

export interface JWTPayload {
  adminId:    string
  username:   string
  role:       string
  type:       'admin' | 'employee'
  permissions?: Record<string, boolean>
}

export function signToken(payload: JWTPayload): string {
  // Add userId as alias for adminId for notification system compatibility
  const tokenPayload = { ...payload, userId: payload.userId || payload.adminId }
  return jwt.sign(tokenPayload, SECRET, { expiresIn: '7d' } as any)
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, SECRET) as JWTPayload
  } catch {
    return null
  }
}

export function getAuth(): JWTPayload | null {
  try {
    const token = cookies().get(AUTH_COOKIE)?.value
    if (!token) return null
    return verifyToken(token)
  } catch {
    return null
  }
}

export function getEmployeeAuth(): JWTPayload | null {
  try {
    const token = cookies().get(EMP_AUTH_COOKIE)?.value
    if (!token) return null
    return verifyToken(token)
  } catch {
    return null
  }
}

export function isSuperAdmin(auth: JWTPayload | null): boolean {
  return auth?.role === 'SuperAdmin'
}

export function hasPermission(auth: JWTPayload | null, permission: string): boolean {
  if (!auth) return false
  if (auth.role === 'SuperAdmin') return true
  return auth.permissions?.[permission] === true
}

// Verify auth from request (for API routes)
export async function verifyAuth(req: NextRequest): Promise<JWTPayload | null> {
  return getAuth()
}
