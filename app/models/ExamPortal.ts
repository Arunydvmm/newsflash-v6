// @ts-nocheck
import mongoose, { Schema } from 'mongoose'

const ExamPortalSchema = new Schema({
  title:          { type: String, required: true },
  slug:           { type: String, unique: true },
  type: {
    type: String,
    enum: ['job-notification', 'admit-card', 'answer-key', 'result', 'exam-date'],
    required: true,
  },
  organization:   { type: String, required: true },
  examName:       { type: String, required: true },
  category: {
    type: String,
    enum: ['SSC', 'UPSC', 'Railway', 'Bank', 'Police', 'Defence', 'Teaching', 'State', 'PSU', 'GATE', 'JEE', 'NEET', 'Other'],
    required: true,
  },
  state:          { type: String, default: 'All India' },
  
  // For job notifications
  totalVacancy:   { type: Number, default: 0 },
  qualification:  [String],
  salaryText:     { type: String, default: '' },
  ageMin:         { type: Number, default: 18 },
  ageMax:         { type: Number, default: 35 },
  
  // For admit cards
  admitCardLink:  { type: String, default: '' },
  rollNumberRequired: { type: Boolean, default: false },
  
  // For answer keys
  answerKeyLink:  { type: String, default: '' },
  setsAvailable:  [String], // e.g., ['Set A', 'Set B', 'Set C']
  
  // For results
  resultLink:     { type: String, default: '' },
  resultDate:     Date,
  
  // Important dates
  importantDates: {
    notificationDate: Date,
    registrationStart: Date,
    registrationEnd: Date,
    examDate: Date,
    admitCardDate: Date,
    answerKeyDate: Date,
    resultDate: Date,
  },
  
  description:    { type: String, default: '' },
  eligibility:    { type: String, default: '' },
  howToApply:     { type: String, default: '' },
  officialWebsite:{ type: String, default: '' },
  applyLink:      { type: String, default: '' },
  notificationPdf:{ type: String, default: '' },
  
  tags:           [String],
  views:          { type: Number, default: 0 },
  isActive:       { type: Boolean, default: true },
  isFeatured:     { type: Boolean, default: false },
  isExpired:      { type: Boolean, default: false },
  postedBy:       { type: Schema.Types.ObjectId, ref: 'Employee' },
}, { timestamps: true })

ExamPortalSchema.pre('validate', function (next) {
  if (this.isModified('title') && this.title) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now()
  }
  // Auto-expire based on exam date
  if (this.importantDates?.examDate && new Date(this.importantDates.examDate) < new Date()) {
    this.isExpired = true
  }
  next()
})

ExamPortalSchema.index({ title: 'text', organization: 'text', tags: 'text' })
ExamPortalSchema.index({ type: 1, category: 1, isActive: 1 })
ExamPortalSchema.index({ state: 1 })
ExamPortalSchema.index({ 'importantDates.examDate': 1 })
ExamPortalSchema.index({ isFeatured: 1, createdAt: -1 })

export default mongoose.models.ExamPortal || mongoose.model('ExamPortal', ExamPortalSchema)
