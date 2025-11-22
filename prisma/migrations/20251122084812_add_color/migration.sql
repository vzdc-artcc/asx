-- AlterTable
ALTER TABLE "SectorMapping"
    ADD COLUMN "consolidationColor" TEXT NOT NULL DEFAULT '#FF0000',
ADD COLUMN     "explorerColor" TEXT NOT NULL DEFAULT '#FFFFFF';
