-- CreateEnum
CREATE TYPE "RequestState" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- DropForeignKey
ALTER TABLE "FileToAgency" DROP CONSTRAINT "FileToAgency_agencyId_fkey";

-- DropForeignKey
ALTER TABLE "FileToAgency" DROP CONSTRAINT "FileToAgency_fileId_fkey";

-- DropForeignKey
ALTER TABLE "FileToCrime" DROP CONSTRAINT "FileToCrime_crimeId_fkey";

-- DropForeignKey
ALTER TABLE "FileToCrime" DROP CONSTRAINT "FileToCrime_fileId_fkey";

-- DropForeignKey
ALTER TABLE "FileToPost" DROP CONSTRAINT "FileToPost_fileId_fkey";

-- DropForeignKey
ALTER TABLE "FileToPost" DROP CONSTRAINT "FileToPost_postId_fkey";

-- AlterTable
ALTER TABLE "Agent" ALTER COLUMN "position" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Request" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fromId" INTEGER NOT NULL,
    "toId" INTEGER NOT NULL,
    "message" TEXT,
    "state" "RequestState" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestToAgency" (
    "requestId" INTEGER NOT NULL,
    "agencyId" INTEGER NOT NULL,

    CONSTRAINT "RequestToAgency_pkey" PRIMARY KEY ("requestId","agencyId")
);

-- CreateTable
CREATE TABLE "_AgencyToRequest" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AgencyToRequest_AB_unique" ON "_AgencyToRequest"("A", "B");

-- CreateIndex
CREATE INDEX "_AgencyToRequest_B_index" ON "_AgencyToRequest"("B");

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "FromUserRequestByIdKey" FOREIGN KEY ("fromId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "ToUserRequestByIdKey" FOREIGN KEY ("fromId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestToAgency" ADD CONSTRAINT "RequestToAgency_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestToAgency" ADD CONSTRAINT "RequestToAgency_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileToPost" ADD CONSTRAINT "FileToPost_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileToPost" ADD CONSTRAINT "FileToPost_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileToCrime" ADD CONSTRAINT "FileToCrime_crimeId_fkey" FOREIGN KEY ("crimeId") REFERENCES "Crime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileToCrime" ADD CONSTRAINT "FileToCrime_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileToAgency" ADD CONSTRAINT "FileToAgency_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileToAgency" ADD CONSTRAINT "FileToAgency_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgencyToRequest" ADD CONSTRAINT "_AgencyToRequest_A_fkey" FOREIGN KEY ("A") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgencyToRequest" ADD CONSTRAINT "_AgencyToRequest_B_fkey" FOREIGN KEY ("B") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;
