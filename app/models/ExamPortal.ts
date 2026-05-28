// @ts-nocheck
import mongoose, { Schema } from 'mongoose'

const ExamPortalSchema = new Schema({
  title:          { type: String, required: true },
  slug:           { type: String, unique: true },
  type: {
    type: String,
    enum: ['job-notification', 'admit-card', 'answer-key', 'result', 'exam-date', 'sarkari-job'],
    required: true,
  },
  organization:   { type: String, required: true },
  examName:       { type: String, default: '' },
  category: {
    type: String,
    enum: ['SSC', 'UPSC', 'Railway', 'Bank', 'Police', 'Defence', 'Teaching', 'State', 'PSU', 'GATE', 'JEE', 'NEET', 'Internship', 'Private', 'Other'],
    required: true,
  },
  state:          { type: String, default: 'All India' },
  
  // For job notifications & sarkari jobs
  totalVacancy:   { type: Number, default: 0 },
  qualification:  [String],
  salaryText:     { type: String, default: '' },
  salaryMin:      { type: Number, default: 0 },
  salaryMax:      { type: Number, default: 0 },
  ageMin:         { type: Number, default: 18 },
  ageMax:         { type: Number, default: 35 },
  applicationFee: { type: String, default: 'No Fee' },
  selectionProcess: [String],
  
  // For admit cards
  admitCardLink:  { type: String, default: '' },
  rollNumberRequired: { type: Boolean, default: false },
  
  // For answer keys
  answerKeyLink:  { type: String, default: '' },
  setsAvailable:  [String], // e.g., ['Set A', 'Set B', 'Set C']
  
  // For results
  resultLink:     { type: String, default: '' },
  
  // Important dates
  importantDates: {
    notificationDate: Date,
    startDate: Date,
    registrationStart: Date,
    registrationEnd: Date,
    lastDate: Date,
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
  // Auto-expire based on relevant date
  const expireDate = this.importantDates?.examDate || this.importantDates?.lastDate || this.importantDates?.resultDate
  if (expireDate && new Date(expireDate) < new Date()) {
    this.isExpired = true
  }
  next()
})

ExamPortalSchema.index({ title: 'text', organization: 'text', tags: 'text' })
ExamPortalSchema.index({ type: 1, category: 1, isActive: 1 })
ExamPortalSchema.index({ state: 1 })
ExamPortalSchema.index({ 'importantDates.examDate': 1, 'importantDates.lastDate': 1 })
ExamPortalSchema.index({ isFeatured: 1, createdAt: -1 })

export default mongoose.models.ExamPortal || mongoose.model('ExamPortal', ExamPortalSchema)
