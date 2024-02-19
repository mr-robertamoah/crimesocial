-- DropForeignKey
ALTER TABLE "CrimeCategory" DROP CONSTRAINT "AgencyCrimeCategoryByIdFKey";

-- DropForeignKey
ALTER TABLE "CrimeCategory" DROP CONSTRAINT "AgentCrimeCategoryByIdFKey";

-- DropForeignKey
ALTER TABLE "CrimeCategory" DROP CONSTRAINT "UserCrimeCategoryByIdFKey";

-- DropForeignKey
ALTER TABLE "CrimeType" DROP CONSTRAINT "AgencyCrimeTypeByIdFKey";

-- DropForeignKey
ALTER TABLE "CrimeType" DROP CONSTRAINT "AgentCrimeTypeByIdFKey";

-- DropForeignKey
ALTER TABLE "CrimeType" DROP CONSTRAINT "UserCrimeTypeByIdFKey";

-- CreateTable
CREATE TABLE "CrimeCategoryToUser" (
    "crimeCategoryId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "CrimeCategoryToUser_pkey" PRIMARY KEY ("crimeCategoryId","userId")
);

-- CreateTable
CREATE TABLE "CrimeCategoryToAgent" (
    "crimeCategoryId" INTEGER NOT NULL,
    "agentId" INTEGER NOT NULL,

    CONSTRAINT "CrimeCategoryToAgent_pkey" PRIMARY KEY ("crimeCategoryId","agentId")
);

-- CreateTable
CREATE TABLE "CrimeCategoryToAgency" (
    "crimeCategoryId" INTEGER NOT NULL,
    "agencyId" INTEGER NOT NULL,

    CONSTRAINT "CrimeCategoryToAgency_pkey" PRIMARY KEY ("crimeCategoryId","agencyId")
);

-- CreateTable
CREATE TABLE "CrimeTypeToUser" (
    "crimeTypeId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "CrimeTypeToUser_pkey" PRIMARY KEY ("crimeTypeId","userId")
);

-- CreateTable
CREATE TABLE "CrimeTypeToAgent" (
    "crimeTypeId" INTEGER NOT NULL,
    "agentId" INTEGER NOT NULL,

    CONSTRAINT "CrimeTypeToAgent_pkey" PRIMARY KEY ("crimeTypeId","agentId")
);

-- CreateTable
CREATE TABLE "CrimeTypeToAgency" (
    "crimeTypeId" INTEGER NOT NULL,
    "agencyId" INTEGER NOT NULL,

    CONSTRAINT "CrimeTypeToAgency_pkey" PRIMARY KEY ("crimeTypeId","agencyId")
);

-- CreateTable
CREATE TABLE "_AgencyToCrimeType" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AgencyToCrimeCategory" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AgentToCrimeCategory" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AgentToCrimeType" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_CrimeCategoryToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_CrimeTypeToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AgencyToCrimeType_AB_unique" ON "_AgencyToCrimeType"("A", "B");

-- CreateIndex
CREATE INDEX "_AgencyToCrimeType_B_index" ON "_AgencyToCrimeType"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AgencyToCrimeCategory_AB_unique" ON "_AgencyToCrimeCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_AgencyToCrimeCategory_B_index" ON "_AgencyToCrimeCategory"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AgentToCrimeCategory_AB_unique" ON "_AgentToCrimeCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_AgentToCrimeCategory_B_index" ON "_AgentToCrimeCategory"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AgentToCrimeType_AB_unique" ON "_AgentToCrimeType"("A", "B");

-- CreateIndex
CREATE INDEX "_AgentToCrimeType_B_index" ON "_AgentToCrimeType"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CrimeCategoryToUser_AB_unique" ON "_CrimeCategoryToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_CrimeCategoryToUser_B_index" ON "_CrimeCategoryToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CrimeTypeToUser_AB_unique" ON "_CrimeTypeToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_CrimeTypeToUser_B_index" ON "_CrimeTypeToUser"("B");

-- AddForeignKey
ALTER TABLE "CrimeCategoryToUser" ADD CONSTRAINT "CrimeCategoryToUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrimeCategoryToUser" ADD CONSTRAINT "CrimeCategoryToUser_crimeCategoryId_fkey" FOREIGN KEY ("crimeCategoryId") REFERENCES "CrimeCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrimeCategoryToAgent" ADD CONSTRAINT "CrimeCategoryToAgent_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrimeCategoryToAgent" ADD CONSTRAINT "CrimeCategoryToAgent_crimeCategoryId_fkey" FOREIGN KEY ("crimeCategoryId") REFERENCES "CrimeCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrimeCategoryToAgency" ADD CONSTRAINT "CrimeCategoryToAgency_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrimeCategoryToAgency" ADD CONSTRAINT "CrimeCategoryToAgency_crimeCategoryId_fkey" FOREIGN KEY ("crimeCategoryId") REFERENCES "CrimeCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrimeTypeToUser" ADD CONSTRAINT "CrimeTypeToUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrimeTypeToUser" ADD CONSTRAINT "CrimeTypeToUser_crimeTypeId_fkey" FOREIGN KEY ("crimeTypeId") REFERENCES "CrimeType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrimeTypeToAgent" ADD CONSTRAINT "CrimeTypeToAgent_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrimeTypeToAgent" ADD CONSTRAINT "CrimeTypeToAgent_crimeTypeId_fkey" FOREIGN KEY ("crimeTypeId") REFERENCES "CrimeType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrimeTypeToAgency" ADD CONSTRAINT "CrimeTypeToAgency_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrimeTypeToAgency" ADD CONSTRAINT "CrimeTypeToAgency_crimeTypeId_fkey" FOREIGN KEY ("crimeTypeId") REFERENCES "CrimeType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgencyToCrimeType" ADD CONSTRAINT "_AgencyToCrimeType_A_fkey" FOREIGN KEY ("A") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgencyToCrimeType" ADD CONSTRAINT "_AgencyToCrimeType_B_fkey" FOREIGN KEY ("B") REFERENCES "CrimeType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgencyToCrimeCategory" ADD CONSTRAINT "_AgencyToCrimeCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgencyToCrimeCategory" ADD CONSTRAINT "_AgencyToCrimeCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "CrimeCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgentToCrimeCategory" ADD CONSTRAINT "_AgentToCrimeCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgentToCrimeCategory" ADD CONSTRAINT "_AgentToCrimeCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "CrimeCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgentToCrimeType" ADD CONSTRAINT "_AgentToCrimeType_A_fkey" FOREIGN KEY ("A") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgentToCrimeType" ADD CONSTRAINT "_AgentToCrimeType_B_fkey" FOREIGN KEY ("B") REFERENCES "CrimeType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CrimeCategoryToUser" ADD CONSTRAINT "_CrimeCategoryToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "CrimeCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CrimeCategoryToUser" ADD CONSTRAINT "_CrimeCategoryToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CrimeTypeToUser" ADD CONSTRAINT "_CrimeTypeToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "CrimeType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CrimeTypeToUser" ADD CONSTRAINT "_CrimeTypeToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
