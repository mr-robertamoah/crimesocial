/*
  Warnings:

  - You are about to drop the column `byId` on the `CrimeCategory` table. All the data in the column will be lost.
  - You are about to drop the column `byType` on the `CrimeCategory` table. All the data in the column will be lost.
  - You are about to drop the column `byId` on the `CrimeType` table. All the data in the column will be lost.
  - You are about to drop the column `byType` on the `CrimeType` table. All the data in the column will be lost.
  - You are about to drop the column `byId` on the `Suggestion` table. All the data in the column will be lost.
  - You are about to drop the column `byType` on the `Suggestion` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Suggestion" DROP CONSTRAINT "AgencySuggestionByIdFKey";

-- DropForeignKey
ALTER TABLE "Suggestion" DROP CONSTRAINT "AgentSuggestionByIdFKey";

-- DropForeignKey
ALTER TABLE "Suggestion" DROP CONSTRAINT "UserSuggestionByIdFKey";

-- AlterTable
ALTER TABLE "CrimeCategory" DROP COLUMN "byId",
DROP COLUMN "byType";

-- AlterTable
ALTER TABLE "CrimeType" DROP COLUMN "byId",
DROP COLUMN "byType";

-- AlterTable
ALTER TABLE "Suggestion" DROP COLUMN "byId",
DROP COLUMN "byType";

-- CreateTable
CREATE TABLE "SuggestionToUser" (
    "suggestionId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "SuggestionToUser_pkey" PRIMARY KEY ("suggestionId","userId")
);

-- CreateTable
CREATE TABLE "SuggestionToAgency" (
    "suggestionId" INTEGER NOT NULL,
    "agencyId" INTEGER NOT NULL,

    CONSTRAINT "SuggestionToAgency_pkey" PRIMARY KEY ("suggestionId","agencyId")
);

-- CreateTable
CREATE TABLE "SuggestionToAgent" (
    "suggestionId" INTEGER NOT NULL,
    "agentId" INTEGER NOT NULL,

    CONSTRAINT "SuggestionToAgent_pkey" PRIMARY KEY ("suggestionId","agentId")
);

-- CreateTable
CREATE TABLE "_AgencyToSuggestion" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AgentToSuggestion" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_SuggestionToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AgencyToSuggestion_AB_unique" ON "_AgencyToSuggestion"("A", "B");

-- CreateIndex
CREATE INDEX "_AgencyToSuggestion_B_index" ON "_AgencyToSuggestion"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AgentToSuggestion_AB_unique" ON "_AgentToSuggestion"("A", "B");

-- CreateIndex
CREATE INDEX "_AgentToSuggestion_B_index" ON "_AgentToSuggestion"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_SuggestionToUser_AB_unique" ON "_SuggestionToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_SuggestionToUser_B_index" ON "_SuggestionToUser"("B");

-- AddForeignKey
ALTER TABLE "SuggestionToUser" ADD CONSTRAINT "SuggestionToUser_suggestionId_fkey" FOREIGN KEY ("suggestionId") REFERENCES "Suggestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuggestionToUser" ADD CONSTRAINT "SuggestionToUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuggestionToAgency" ADD CONSTRAINT "SuggestionToAgency_suggestionId_fkey" FOREIGN KEY ("suggestionId") REFERENCES "Suggestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuggestionToAgency" ADD CONSTRAINT "SuggestionToAgency_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuggestionToAgent" ADD CONSTRAINT "SuggestionToAgent_suggestionId_fkey" FOREIGN KEY ("suggestionId") REFERENCES "Suggestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuggestionToAgent" ADD CONSTRAINT "SuggestionToAgent_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgencyToSuggestion" ADD CONSTRAINT "_AgencyToSuggestion_A_fkey" FOREIGN KEY ("A") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgencyToSuggestion" ADD CONSTRAINT "_AgencyToSuggestion_B_fkey" FOREIGN KEY ("B") REFERENCES "Suggestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgentToSuggestion" ADD CONSTRAINT "_AgentToSuggestion_A_fkey" FOREIGN KEY ("A") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgentToSuggestion" ADD CONSTRAINT "_AgentToSuggestion_B_fkey" FOREIGN KEY ("B") REFERENCES "Suggestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SuggestionToUser" ADD CONSTRAINT "_SuggestionToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Suggestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SuggestionToUser" ADD CONSTRAINT "_SuggestionToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
