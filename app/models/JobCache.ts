// @ts-nocheck
import mongoose, { Schema } from 'mongoose'

// Stores IndianAPI job data in MongoDB to minimize API hits
// Free tier = 75 hours of data — we cache for 6 hours per fetch
const JobCacheSchema = new Schema({
  cacheKey:  { type: String, required: true, unique: true },
  jobs:      { type: Array, default: [] },
  total:     { type: Number, default: 0 },
  fetchedAt: { type: Date, default: Date.now },
}, { timestamps: true })

JobCacheSchema.index({ cacheKey: 1 })
JobCacheSchema.index({ fetchedAt: 1 })

export default mongoose.models.JobCache || mongoose.model('JobCache', JobCacheSchema)
