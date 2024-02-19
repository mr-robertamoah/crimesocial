/*
  Warnings:

  - You are about to drop the column `postableId` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `postableType` on the `Post` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "AgencyPostByIdFKey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "CrimePostByIdFKey";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "postableId",
DROP COLUMN "postableType";

-- CreateTable
CREATE TABLE "PostToAgency" (
    "postId" INTEGER NOT NULL,
    "agencyId" INTEGER NOT NULL,

    CONSTRAINT "PostToAgency_pkey" PRIMARY KEY ("postId","agencyId")
);

-- CreateTable
CREATE TABLE "PostToCrime" (
    "postId" INTEGER NOT NULL,
    "crimeId" INTEGER NOT NULL,

    CONSTRAINT "PostToCrime_pkey" PRIMARY KEY ("postId","crimeId")
);

-- CreateTable
CREATE TABLE "_AgencyToPost" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_CrimeToPost" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AgencyToPost_AB_unique" ON "_AgencyToPost"("A", "B");

-- CreateIndex
CREATE INDEX "_AgencyToPost_B_index" ON "_AgencyToPost"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CrimeToPost_AB_unique" ON "_CrimeToPost"("A", "B");

-- CreateIndex
CREATE INDEX "_CrimeToPost_B_index" ON "_CrimeToPost"("B");

-- AddForeignKey
ALTER TABLE "PostToAgency" ADD CONSTRAINT "PostToAgency_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostToAgency" ADD CONSTRAINT "PostToAgency_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostToCrime" ADD CONSTRAINT "PostToCrime_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostToCrime" ADD CONSTRAINT "PostToCrime_crimeId_fkey" FOREIGN KEY ("crimeId") REFERENCES "Crime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgencyToPost" ADD CONSTRAINT "_AgencyToPost_A_fkey" FOREIGN KEY ("A") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgencyToPost" ADD CONSTRAINT "_AgencyToPost_B_fkey" FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CrimeToPost" ADD CONSTRAINT "_CrimeToPost_A_fkey" FOREIGN KEY ("A") REFERENCES "Crime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CrimeToPost" ADD CONSTRAINT "_CrimeToPost_B_fkey" FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
