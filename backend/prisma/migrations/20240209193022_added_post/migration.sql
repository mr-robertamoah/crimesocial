/*
  Warnings:

  - You are about to drop the `DescriptiveMarkers` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PostableType" AS ENUM ('Agency', 'Crime');

-- AlterEnum
ALTER TYPE "FileableType" ADD VALUE 'Post';

-- DropForeignKey
ALTER TABLE "DescriptiveMarkers" DROP CONSTRAINT "DescriptiveMarkers_userId_fkey";

-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "AgencyFileByIdFKey";

-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "CrimeFileByIdFKey";

-- AlterTable
ALTER TABLE "Agency" ALTER COLUMN "verifiedBy" DROP NOT NULL;

-- AlterTable
ALTER TABLE "File" ALTER COLUMN "fileableId" DROP NOT NULL,
ALTER COLUMN "fileableType" DROP NOT NULL;

-- DropTable
DROP TABLE "DescriptiveMarkers";

-- CreateTable
CREATE TABLE "DescriptiveMarker" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "DescriptiveMarker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "content" TEXT,
    "userId" INTEGER NOT NULL,
    "postableId" INTEGER NOT NULL,
    "postableType" "PostableType" NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileToPost" (
    "postId" INTEGER NOT NULL,
    "fileId" INTEGER NOT NULL,

    CONSTRAINT "FileToPost_pkey" PRIMARY KEY ("postId","fileId")
);

-- CreateTable
CREATE TABLE "_FileToPost" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_FileToPost_AB_unique" ON "_FileToPost"("A", "B");

-- CreateIndex
CREATE INDEX "_FileToPost_B_index" ON "_FileToPost"("B");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "CrimeFileByIdFKey" FOREIGN KEY ("fileableId") REFERENCES "Crime"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "AgencyFileByIdFKey" FOREIGN KEY ("fileableId") REFERENCES "Agency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DescriptiveMarker" ADD CONSTRAINT "DescriptiveMarker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "CrimePostByIdFKey" FOREIGN KEY ("postableId") REFERENCES "Crime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "AgencyPostByIdFKey" FOREIGN KEY ("postableId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileToPost" ADD CONSTRAINT "FileToPost_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileToPost" ADD CONSTRAINT "FileToPost_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FileToPost" ADD CONSTRAINT "_FileToPost_A_fkey" FOREIGN KEY ("A") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FileToPost" ADD CONSTRAINT "_FileToPost_B_fkey" FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
