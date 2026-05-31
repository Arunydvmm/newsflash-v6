// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '../../../lib/db'
import Admin from '../../../models/Admin'
import { signToken, AUTH_COOKIE } from '../../../lib/auth'

export async function POST(req: NextRequest) {
  const { username, password, role, remember } = await req.json()
  if (!username || !password)
    return NextResponse.json({ error: 'Username and password required' }, { status: 400 })

  await connectDB()
  const admin = await Admin.findOne({ username: username.toLowerCase().trim() })
  if (!admin || !(await admin.comparePassword(password)))
    return NextResponse.json({ error: 'Invalid credentials. Attempt logged.' }, { status: 401 })

  // Check if requested role matches actual role (optional security check)
  if (role && role !== admin.role) {
    return NextResponse.json({ error: 'Clearance level mismatch' }, { status: 403 })
  }

  admin.lastLogin = new Date()
  await admin.save()

  const token = signToken({ 
    adminId: String(admin._id), 
    username: admin.username, 
    role: admin.role,
    type: 'admin'
  })
  const res = NextResponse.json({ success: true, username: admin.username, role: admin.role })
  
  // Adjust cookie maxAge based on remember preference
  const maxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7 // 30 days if remember, else 7 days
  
  res.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   maxAge,
    path:     '/',
  })
  return res
}
