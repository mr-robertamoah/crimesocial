/*
  Warnings:

  - Added the required column `crimeTypeId` to the `Crime` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Crime" ADD COLUMN     "crimeTypeId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Crime" ADD CONSTRAINT "Crime_crimeTypeId_fkey" FOREIGN KEY ("crimeTypeId") REFERENCES "CrimeType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
