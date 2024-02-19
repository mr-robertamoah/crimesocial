/*
  Warnings:

  - Made the column `message` on table `Suggestion` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "CrimeCategory" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "CrimeType" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "Suggestion" ALTER COLUMN "message" SET NOT NULL;
