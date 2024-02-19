/*
  Warnings:

  - You are about to drop the column `description` on the `CrimeCategory` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `CrimeType` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CrimeCategory" DROP COLUMN "description";

-- AlterTable
ALTER TABLE "CrimeType" DROP COLUMN "description";
