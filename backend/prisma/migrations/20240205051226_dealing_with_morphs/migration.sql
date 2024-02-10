/*
  Warnings:

  - You are about to drop the column `by` on the `CrimeCategory` table. All the data in the column will be lost.
  - You are about to drop the column `by` on the `CrimeType` table. All the data in the column will be lost.
  - Added the required column `byId` to the `CrimeCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `byType` to the `CrimeCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `byId` to the `CrimeType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `byType` to the `CrimeType` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AgencyToCrime" DROP CONSTRAINT "AgencyToCrime_agencyId_fkey";

-- DropForeignKey
ALTER TABLE "AgencyToCrime" DROP CONSTRAINT "AgencyToCrime_crimeId_fkey";

-- DropForeignKey
ALTER TABLE "AgentToCrime" DROP CONSTRAINT "AgentToCrime_agentId_fkey";

-- DropForeignKey
ALTER TABLE "AgentToCrime" DROP CONSTRAINT "AgentToCrime_crimeId_fkey";

-- DropForeignKey
ALTER TABLE "Avatar" DROP CONSTRAINT "Avatar_userId_fkey";

-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_crimeId_fkey";

-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_userId_fkey";

-- AlterTable
ALTER TABLE "CrimeCategory" DROP COLUMN "by",
ADD COLUMN     "byId" INTEGER NOT NULL,
ADD COLUMN     "byType" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CrimeType" DROP COLUMN "by",
ADD COLUMN     "byId" INTEGER NOT NULL,
ADD COLUMN     "byType" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Avatar" ADD CONSTRAINT "Avatar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_crimeId_fkey" FOREIGN KEY ("crimeId") REFERENCES "Crime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgencyToCrime" ADD CONSTRAINT "AgencyToCrime_crimeId_fkey" FOREIGN KEY ("crimeId") REFERENCES "Crime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgencyToCrime" ADD CONSTRAINT "AgencyToCrime_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentToCrime" ADD CONSTRAINT "AgentToCrime_crimeId_fkey" FOREIGN KEY ("crimeId") REFERENCES "Crime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentToCrime" ADD CONSTRAINT "AgentToCrime_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrimeCategory" ADD CONSTRAINT "UserCrimeCategoryByIdFKey" FOREIGN KEY ("byId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrimeCategory" ADD CONSTRAINT "AgencyCrimeCategoryByIdFKey" FOREIGN KEY ("byId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrimeCategory" ADD CONSTRAINT "AgentCrimeCategoryByIdFKey" FOREIGN KEY ("byId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrimeType" ADD CONSTRAINT "UserCrimeTypeByIdFKey" FOREIGN KEY ("byId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrimeType" ADD CONSTRAINT "AgencyCrimeTypeByIdFKey" FOREIGN KEY ("byId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrimeType" ADD CONSTRAINT "AgentCrimeTypeByIdFKey" FOREIGN KEY ("byId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
