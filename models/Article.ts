// @ts-nocheck
import mongoose from 'mongoose'

const ArticleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true, required: true },
  category: { type: String, required: true },
  summary: { type: String, required: true },
  content: { type: String, required: true },
  author: String,
  featuredImage: String,
  tags: [String],
  readTime: { type: Number, default: 3 },
  views: { type: Number, default: 0 },
  status: { type: String, default: 'draft', enum: ['draft', 'published', 'archived'] },
  
  // NEW: Data-driven fields
  isDataDriven: { type: Boolean, default: false },
  articleType: String,
  dataSource: String,
  lastUpdated: Date,

  // NEW: AI Pipeline fields
  metaTitle: String,
  excerpt: String,
  overallScore: Number,
  coverImage: String,
  inlineImages: [String],
  imageCredits: String,
  contentOrigin: String,
  videoUrl: String,
  keyHighlights: [String],
  referenceLinks: [{ sourceName: String, url: String }],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

const ArticleModel = mongoose.models.Article || mongoose.model('Article', ArticleSchema)

export default ArticleModel as any
