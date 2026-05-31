-- CreateEnum
CREATE TYPE "NfStatus" AS ENUM ('MONITORING', 'RESEARCH', 'EXTRACTION', 'FACT_CHECK', 'JUNIOR_DRAFT', 'SENIOR_EDIT', 'BIAS_REVIEW', 'LEGAL_REVIEW', 'COPYRIGHT_REVIEW', 'SEO_REVIEW', 'CHIEF_EDITOR', 'DRAFT_READY', 'APPROVED', 'REJECTED', 'BLOCKED', 'PUBLISHED');

-- CreateTable
CREATE TABLE "NfArticle" (
    "id" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "region" TEXT NOT NULL DEFAULT 'India',
    "priority" TEXT NOT NULL DEFAULT 'STANDARD',
    "pipelineStatus" "NfStatus" NOT NULL DEFAULT 'MONITORING',
    "currentStage" TEXT NOT NULL DEFAULT 'monitoring',
    "title" TEXT,
    "content" TEXT,
    "summary" TEXT,
    "slug" TEXT,
    "category" TEXT,
    "tags" TEXT[],
    "keyHighlights" TEXT[],
    "referenceLinks" JSONB[],
    "isBreaking" BOOLEAN NOT NULL DEFAULT false,
    "aiDisclosure" TEXT NOT NULL DEFAULT 'This article was researched and drafted with AI assistance and reviewed by our editorial team.',
    "metaDescription" TEXT,
    "metaTitle" TEXT,
    "excerpt" TEXT,
    "isGovernmentVerified" BOOLEAN NOT NULL DEFAULT false,
    "governmentSource" TEXT,
    "ogTags" JSONB,
    "schemaMarkup" JSONB,
    "socialPosts" JSONB,
    "overallConfidence" DOUBLE PRECISION,
    "overallRiskLevel" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "editorialGrade" TEXT,
    "overallScore" DOUBLE PRECISION,
    "plagiarismScore" DOUBLE PRECISION,
    "legalVerdict" TEXT NOT NULL DEFAULT 'PENDING',
    "copyrightVerdict" TEXT NOT NULL DEFAULT 'PENDING',
    "factCheckVerdict" TEXT NOT NULL DEFAULT 'PENDING',
    "biasVerdict" TEXT NOT NULL DEFAULT 'PENDING',
    "blockReason" TEXT,
    "humanDecision" TEXT,
    "humanNotes" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "publishedArticleId" TEXT,
    "coverImage" TEXT,
    "featuredImage" TEXT,
    "inlineImages" JSONB NOT NULL DEFAULT '[]',
    "imageCredits" JSONB NOT NULL DEFAULT '[]',
    "contentOrigin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NfArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NfWorkflow" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "status" "NfStatus" NOT NULL DEFAULT 'MONITORING',
    "error" TEXT,

    CONSTRAINT "NfWorkflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NfStageLog" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "stageName" TEXT NOT NULL,
    "stageStatus" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "report" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "recommendation" TEXT NOT NULL,
    "tokensUsed" INTEGER NOT NULL,
    "processingMs" INTEGER NOT NULL,

    CONSTRAINT "NfStageLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NfContentLog" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "stageName" TEXT NOT NULL,
    "contentBefore" TEXT NOT NULL,
    "contentAfter" TEXT NOT NULL,
    "diff" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NfContentLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NfSummaryReport" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "overallConfidence" DOUBLE PRECISION NOT NULL,
    "overallRiskLevel" TEXT NOT NULL,
    "editorialGrade" TEXT NOT NULL,
    "factCheckSummary" JSONB NOT NULL,
    "legalSummary" JSONB NOT NULL,
    "copyrightSummary" JSONB NOT NULL,
    "biasSummary" JSONB NOT NULL,
    "seoSummary" JSONB NOT NULL,
    "recommendations" TEXT[],
    "stageConfidences" JSONB NOT NULL,
    "totalTokensUsed" INTEGER NOT NULL,
    "totalProcessingTime" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NfSummaryReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NfSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastFetched" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NfSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NfAuditLog" (
    "id" TEXT NOT NULL,
    "articleId" TEXT,
    "action" TEXT NOT NULL,
    "performedBy" TEXT NOT NULL,
    "reason" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NfAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NfSystemConfig" (
    "id" TEXT NOT NULL,
    "emergencyStop" BOOLEAN NOT NULL DEFAULT false,
    "rateLimitTimestamps" TEXT,
    "keyCooldowns" TEXT,
    "agentSleepStatuses" TEXT,
    "engineStopped" BOOLEAN NOT NULL DEFAULT false,
    "engineStoppedAt" TIMESTAMP(3),
    "engineStoppedBy" TEXT,
    "lastUpdatedBy" TEXT,
    "lastUpdatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NfSystemConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NfWatchlist" (
    "id" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "region" TEXT NOT NULL DEFAULT 'India',
    "priority" TEXT NOT NULL DEFAULT 'STANDARD',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "articleId" TEXT,
    "contentSnippet" TEXT,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NfWatchlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NfPipelineSlot" (
    "id" TEXT NOT NULL,
    "slotNumber" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'IDLE',
    "currentJobId" TEXT,
    "startedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NfPipelineSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NfPipelineJob" (
    "id" TEXT NOT NULL,
    "watchlistId" TEXT NOT NULL,
    "slotNumber" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "currentStage" TEXT,
    "currentAgent" TEXT,
    "stageStatuses" JSONB NOT NULL DEFAULT '{}',
    "agentReports" JSONB NOT NULL DEFAULT '{}',
    "sleepLog" JSONB NOT NULL DEFAULT '[]',
    "queuePosition" INTEGER,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "failReason" TEXT,
    "articleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NfPipelineJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NfArticle_pipelineStatus_idx" ON "NfArticle"("pipelineStatus");

-- CreateIndex
CREATE INDEX "NfArticle_createdAt_idx" ON "NfArticle"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "NfWorkflow_articleId_key" ON "NfWorkflow"("articleId");

-- CreateIndex
CREATE INDEX "NfWorkflow_status_idx" ON "NfWorkflow"("status");

-- CreateIndex
CREATE INDEX "NfStageLog_articleId_idx" ON "NfStageLog"("articleId");

-- CreateIndex
CREATE INDEX "NfStageLog_stageName_idx" ON "NfStageLog"("stageName");

-- CreateIndex
CREATE INDEX "NfContentLog_articleId_idx" ON "NfContentLog"("articleId");

-- CreateIndex
CREATE INDEX "NfContentLog_stageName_idx" ON "NfContentLog"("stageName");

-- CreateIndex
CREATE UNIQUE INDEX "NfSummaryReport_articleId_key" ON "NfSummaryReport"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "NfSource_name_key" ON "NfSource"("name");

-- CreateIndex
CREATE INDEX "NfSource_enabled_idx" ON "NfSource"("enabled");

-- CreateIndex
CREATE INDEX "NfAuditLog_articleId_idx" ON "NfAuditLog"("articleId");

-- CreateIndex
CREATE INDEX "NfAuditLog_action_idx" ON "NfAuditLog"("action");

-- CreateIndex
CREATE INDEX "NfAuditLog_createdAt_idx" ON "NfAuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "NfWatchlist_status_idx" ON "NfWatchlist"("status");

-- CreateIndex
CREATE INDEX "NfWatchlist_createdAt_idx" ON "NfWatchlist"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "NfPipelineSlot_slotNumber_key" ON "NfPipelineSlot"("slotNumber");

-- AddForeignKey
ALTER TABLE "NfWorkflow" ADD CONSTRAINT "NfWorkflow_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "NfArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NfStageLog" ADD CONSTRAINT "NfStageLog_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "NfArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NfContentLog" ADD CONSTRAINT "NfContentLog_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "NfArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NfSummaryReport" ADD CONSTRAINT "NfSummaryReport_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "NfArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NfAuditLog" ADD CONSTRAINT "NfAuditLog_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "NfArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NfPipelineJob" ADD CONSTRAINT "NfPipelineJob_watchlistId_fkey" FOREIGN KEY ("watchlistId") REFERENCES "NfWatchlist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
