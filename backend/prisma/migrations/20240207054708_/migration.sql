/*
  Warnings:

  - Added the required column `anonymous` to the `Crime` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Crime" ADD COLUMN     "anonymous" BOOLEAN NOT NULL,
ADD COLUMN     "userId" INTEGER;

-- AddForeignKey
ALTER TABLE "Crime" ADD CONSTRAINT "Crime_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
