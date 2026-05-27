// @ts-nocheck
// Server component — fetches ad slots from DB and renders client AdSlot
import { connectDB } from '../lib/db'
import AdSlot from '../models/AdSlot'
import AdSlotClient from './AdSlot'

interface Props {
  slotId: string
  style?: React.CSSProperties
  className?: string
}

export default async function AdSlotServer({ slotId, style, className }: Props) {
  try {
    await connectDB()
    const slot = await AdSlot.findOne({ slotId }).lean()
    
    // Debug logging
    if (!slot) {
      console.warn(`[AdSlot] Slot not found: ${slotId}`)
      return null
    }
    
    if (!slot.enabled) {
      console.warn(`[AdSlot] Slot disabled: ${slotId}`)
      return null
    }
    
    if (!slot.script) {
      console.warn(`[AdSlot] No script for slot: ${slotId}`)
      return null
    }

    console.log(`[AdSlot] Rendering slot: ${slotId} (${slot.script.length} chars)`)

    return (
      <AdSlotClient
        slotId={slot.slotId}
        script={slot.script}
        enabled={slot.enabled}
        size={slot.size}
        style={style}
        className={className}
      />
    )
  } catch (err) {
    console.error(`[AdSlot] Error fetching slot ${slotId}:`, err)
    return null
  }
}
