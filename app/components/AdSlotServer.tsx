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
    if (!slot || !slot.enabled || !slot.script) return null

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
  } catch {
    return null
  }
}
