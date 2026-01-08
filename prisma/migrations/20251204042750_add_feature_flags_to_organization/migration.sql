-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "allowedFeatures" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "isSandbox" BOOLEAN NOT NULL DEFAULT false;
