// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '../../lib/db'
import AdSlot from '../../models/AdSlot'

export async function GET(req: NextRequest) {
  await connectDB()
  
  // Check if fetching a single slot by query param
  const slotId = req.nextUrl.searchParams.get('slotId')
  
  if (slotId) {
    const slot = await AdSlot.findOne({ slotId }).lean()
    if (slot) {
      return NextResponse.json(slot)
    }
    return NextResponse.json({ error: 'Slot not found' }, { status: 404 })
  }
  
  // Fetch all slots
  const slots = await AdSlot.find().lean()

  // Auto-add any missing slots (for existing installs)
  const defaultSlots = [
    { slotId: 'popunder',           name: 'Popunder',             type: 'Popunder',        size: 'Global',      position: 'Injected globally on all pages',                    enabled: false, script: '' },
    { slotId: 'native-banner',      name: 'Native Banner',        type: 'Native',          size: 'Native',      position: 'Below article grid on homepage',                    enabled: false, script: '' },
    { slotId: 'banner-728x90',      name: 'Banner 728×90',        type: 'Banner',          size: '728×90',      position: 'Header leaderboard & mid-article on all pages',     enabled: false, script: '' },
    { slotId: 'banner-300x250',     name: 'Banner 300×250',       type: 'Banner',          size: '300×250',     position: 'Sidebar rectangles on all pages',                   enabled: false, script: '' },
    { slotId: 'social-bar',         name: 'Social Bar',           type: 'Social Bar',      size: 'Dynamic',     position: 'Floating social sharing bar on all pages',          enabled: false, script: '' },
    { slotId: 'smartlink',          name: 'Smartlink',            type: 'Smartlink',       size: 'Dynamic',     position: 'Smart link ads (auto-sizing) on all pages',         enabled: false, script: '' },
    { slotId: 'banner-320x50',      name: 'Banner 320×50',        type: 'Banner',          size: '320×50',      position: 'Mobile sticky footer on all pages',                 enabled: false, script: '' },
    { slotId: 'banner-160x600',     name: 'Banner 160×600',       type: 'Banner',          size: '160×600',     position: 'Wide skyscraper sidebar on all pages',              enabled: false, script: '' },
    { slotId: 'banner-160x300',     name: 'Banner 160×300',       type: 'Banner',          size: '160×300',     position: 'Half-page sidebar on all pages',                    enabled: false, script: '' },
    { slotId: 'banner-468x60',      name: 'Banner 468×60',        type: 'Banner',          size: '468×60',      position: 'Half-page banner on all pages',                     enabled: false, script: '' },
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
  try {
    // Auth check — reads cookie directly from request
    const token = req.cookies.get('nf_token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - no token' }, { status: 401 })
    }
    
    const { verifyToken } = await import('../../lib/auth')
    const auth = verifyToken(token)
    
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized - invalid token' }, { status: 401 })
    }

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
  } catch (error: any) {
    console.error('[Ads API PUT Error]', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

// Handle unsupported methods
export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function PATCH() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
