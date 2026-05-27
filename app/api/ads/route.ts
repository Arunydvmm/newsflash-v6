// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '../../lib/db'
import AdSlot from '../../models/AdSlot'

export async function GET() {
  await connectDB()
  const slots = await AdSlot.find().lean()

  // Auto-add any missing slots (for existing installs)
  const defaultSlots = [
    { slotId: 'popunder',           name: 'Popunder (Global)',    size: 'Global',  position: 'Injected globally on all pages',   enabled: false, script: '' },
    { slotId: 'native-banner',      name: 'Native Banner',        size: 'Native',  position: 'Below article grid on homepage',  enabled: false, script: '' },
    { slotId: 'header-leaderboard', name: 'Header Leaderboard',   size: '728×90',  position: 'Below navigation in site header', enabled: false, script: '' },
    { slotId: 'sidebar-rectangle',  name: 'Sidebar Rectangle',    size: '300×250', position: 'Right sidebar on homepage',       enabled: false, script: '' },
    { slotId: 'mid-article',        name: 'Mid-Article Banner',   size: '728×90',  position: 'Mid-way through article body',    enabled: false, script: '' },
    { slotId: 'mobile-sticky',      name: 'Mobile Sticky Footer', size: '320×50',  position: 'Sticky bottom on mobile devices', enabled: false, script: '' },
    { slotId: 'cricket-sidebar',    name: 'Cricket Sidebar',      size: '300×250', position: 'Cricket section sidebar',         enabled: false, script: '' },
    { slotId: 'sarkari-sidebar',    name: 'Sarkari Sidebar',      size: '300×250', position: 'Sarkari Naukri section sidebar',  enabled: false, script: '' },
  ]
  const existingIds = slots.map((s: any) => s.slotId)
  const missing = defaultSlots.filter(s => !existingIds.includes(s.slotId))
  if (missing.length > 0) {
    await AdSlot.insertMany(missing)
    const updated = await AdSlot.find().lean()
    return NextResponse.json(updated)
  }

  return NextResponse.json(slots)
}

export async function PUT(req: NextRequest) {
  // Auth check — reads cookie directly from request (works in Route Handlers)
  const token = req.cookies.get('nf_token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { verifyToken } = await import('../../lib/auth')
  const auth = verifyToken(token)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const slots = await req.json()
  const updates = await Promise.all(
    slots.map((s: any) =>
      AdSlot.findOneAndUpdate(
        { slotId: s.slotId },
        { enabled: s.enabled, script: s.script },
        { new: true }
      )
    )
  )
  return NextResponse.json(updates)
}
