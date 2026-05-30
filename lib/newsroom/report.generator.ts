import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function generateReport(
  articleId: string,
  totalTokensUsed: number,
  totalProcessingTime: number
): Promise<void> {
  // Get all stage logs
  const stageLogs = await prisma.nfStageLog.findMany({
    where: { articleId },
    orderBy: { startTime: 'asc' }
  })

  // Calculate overall confidence
  const stageConfidences = stageLogs.map(log => log.confidence)
  const overallConfidence = stageConfidences.reduce((a, b) => a + b, 0) / stageConfidences.length

  // Determine overall risk level
  const riskLevels: string[] = []
  for (const log of stageLogs) {
    const report = log.report as any
    if (report.riskLevel === 'HIGH' || report.riskLevel === 'MEDIUM') {
      riskLevels.push(report.riskLevel)
    }
  }
  const overallRiskLevel = riskLevels.includes('HIGH') ? 'HIGH' : riskLevels.includes('MEDIUM') ? 'MEDIUM' : 'LOW'

  // Determine editorial grade
  let editorialGrade = 'C'
  if (overallConfidence > 0.9 && overallRiskLevel === 'LOW') {
    editorialGrade = 'A'
  } else if (overallConfidence > 0.8 && overallRiskLevel === 'LOW') {
    editorialGrade = 'B'
  } else if (overallConfidence > 0.7) {
    editorialGrade = 'C'
  } else {
    editorialGrade = 'REWRITE'
  }

  // Build summary report
  const summaryReport = {
    overallConfidence,
    overallRiskLevel,
    editorialGrade,
    factCheckSummary: stageLogs.find(l => l.stageName === 'FACT_CHECK')?.report,
    legalSummary: stageLogs.find(l => l.stageName === 'LEGAL_REVIEW')?.report,
    copyrightSummary: stageLogs.find(l => l.stageName === 'COPYRIGHT_REVIEW')?.report,
    biasSummary: stageLogs.find(l => l.stageName === 'BIAS_REVIEW')?.report,
    seoSummary: stageLogs.find(l => l.stageName === 'SEO_REVIEW')?.report,
    recommendations: stageLogs.map(l => l.recommendation),
    stageConfidences: Object.fromEntries(stageLogs.map(l => [l.stageName, l.confidence])),
    totalTokensUsed,
    totalProcessingTime
  }

  // Create summary report record
  await prisma.nfSummaryReport.create({
    data: {
      articleId,
      overallConfidence,
      overallRiskLevel,
      editorialGrade,
      factCheckSummary: summaryReport.factCheckSummary || {},
      legalSummary: summaryReport.legalSummary || {},
      copyrightSummary: summaryReport.copyrightSummary || {},
      biasSummary: summaryReport.biasSummary || {},
      seoSummary: summaryReport.seoSummary || {},
      recommendations: summaryReport.recommendations,
      stageConfidences: summaryReport.stageConfidences,
      totalTokensUsed,
      totalProcessingTime
    }
  })

  // Update article with summary data
  await prisma.nfArticle.update({
    where: { id: articleId },
    data: {
      overallConfidence,
      overallRiskLevel,
      editorialGrade
    }
  })
}
