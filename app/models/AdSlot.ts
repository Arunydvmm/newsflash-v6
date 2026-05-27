// @ts-nocheck
import mongoose, { Schema } from 'mongoose'

const AdSlotSchema = new Schema({
  slotId:   { type: String, required: true, unique: true },
  name:     String,
  type:     { type: String, default: 'Banner' }, // Banner, Native, Popunder, Social Bar, Smartlink
  size:     String,
  position: String,
  enabled:  { type: Boolean, default: false },
  script:   { type: String, default: '' },
}, { timestamps: true })

export default mongoose.models.AdSlot || mongoose.model('AdSlot', AdSlotSchema)
