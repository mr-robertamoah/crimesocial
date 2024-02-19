/*
  Warnings:

  - You are about to drop the column `fileableId` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `fileableType` on the `File` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "AgencyFileByIdFKey";

-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "CrimeFileByIdFKey";

-- AlterTable
ALTER TABLE "Agency" ADD COLUMN     "email" TEXT,
ADD COLUMN     "phoneNumber" TEXT;

-- AlterTable
ALTER TABLE "File" DROP COLUMN "fileableId",
DROP COLUMN "fileableType";

-- DropEnum
DROP TYPE "FileableType";

-- CreateTable
CREATE TABLE "FileToCrime" (
    "crimeId" INTEGER NOT NULL,
    "fileId" INTEGER NOT NULL,

    CONSTRAINT "FileToCrime_pkey" PRIMARY KEY ("crimeId","fileId")
);

-- CreateTable
CREATE TABLE "FileToAgency" (
    "agencyId" INTEGER NOT NULL,
    "fileId" INTEGER NOT NULL,

    CONSTRAINT "FileToAgency_pkey" PRIMARY KEY ("agencyId","fileId")
);

-- CreateTable
CREATE TABLE "_AgencyToFile" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_CrimeToFile" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AgencyToFile_AB_unique" ON "_AgencyToFile"("A", "B");

-- CreateIndex
CREATE INDEX "_AgencyToFile_B_index" ON "_AgencyToFile"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CrimeToFile_AB_unique" ON "_CrimeToFile"("A", "B");

-- CreateIndex
CREATE INDEX "_CrimeToFile_B_index" ON "_CrimeToFile"("B");

-- AddForeignKey
ALTER TABLE "FileToCrime" ADD CONSTRAINT "FileToCrime_crimeId_fkey" FOREIGN KEY ("crimeId") REFERENCES "Crime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileToCrime" ADD CONSTRAINT "FileToCrime_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileToAgency" ADD CONSTRAINT "FileToAgency_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileToAgency" ADD CONSTRAINT "FileToAgency_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgencyToFile" ADD CONSTRAINT "_AgencyToFile_A_fkey" FOREIGN KEY ("A") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgencyToFile" ADD CONSTRAINT "_AgencyToFile_B_fkey" FOREIGN KEY ("B") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CrimeToFile" ADD CONSTRAINT "_CrimeToFile_A_fkey" FOREIGN KEY ("A") REFERENCES "Crime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CrimeToFile" ADD CONSTRAINT "_CrimeToFile_B_fkey" FOREIGN KEY ("B") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;
