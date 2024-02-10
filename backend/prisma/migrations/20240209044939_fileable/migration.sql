/*
  Warnings:

  - You are about to drop the column `crimeId` on the `File` table. All the data in the column will be lost.
  - Added the required column `fileableId` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileableType` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FileableType" AS ENUM ('Crime', 'Agency');

-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_crimeId_fkey";

-- AlterTable
ALTER TABLE "Crime" ADD COLUMN     "crimeTypeName" TEXT,
ALTER COLUMN "crimeTypeId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "File" DROP COLUMN "crimeId",
ADD COLUMN     "fileableId" INTEGER NOT NULL,
ADD COLUMN     "fileableType" "FileableType" NOT NULL;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "CrimeFileByIdFKey" FOREIGN KEY ("fileableId") REFERENCES "Crime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "AgencyFileByIdFKey" FOREIGN KEY ("fileableId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
