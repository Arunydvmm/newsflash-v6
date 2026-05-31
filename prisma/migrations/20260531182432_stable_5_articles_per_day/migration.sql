-- AlterTable
ALTER TABLE "NfSystemConfig" ADD COLUMN     "googleTokensToday" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "groqTokensToday" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "maxArticlesPerDay" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "mistralTokensToday" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tokenResetDate" TEXT;
