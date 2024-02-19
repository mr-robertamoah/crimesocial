-- AlterEnum
ALTER TYPE "AgencyType" ADD VALUE 'PROFIT';

-- DropForeignKey
ALTER TABLE "Avatar" DROP CONSTRAINT "Avatar_userId_fkey";

-- CreateTable
CREATE TABLE "AvatarToUser" (
    "avatarId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "AvatarToUser_pkey" PRIMARY KEY ("avatarId","userId")
);

-- CreateTable
CREATE TABLE "AvatarToAgency" (
    "avatarId" INTEGER NOT NULL,
    "agencyId" INTEGER NOT NULL,

    CONSTRAINT "AvatarToAgency_pkey" PRIMARY KEY ("avatarId","agencyId")
);

-- CreateTable
CREATE TABLE "_AvatarToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AgencyToAvatar" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AvatarToUser_AB_unique" ON "_AvatarToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_AvatarToUser_B_index" ON "_AvatarToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AgencyToAvatar_AB_unique" ON "_AgencyToAvatar"("A", "B");

-- CreateIndex
CREATE INDEX "_AgencyToAvatar_B_index" ON "_AgencyToAvatar"("B");

-- AddForeignKey
ALTER TABLE "AvatarToUser" ADD CONSTRAINT "AvatarToUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvatarToUser" ADD CONSTRAINT "AvatarToUser_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "Avatar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvatarToAgency" ADD CONSTRAINT "AvatarToAgency_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvatarToAgency" ADD CONSTRAINT "AvatarToAgency_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "Avatar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AvatarToUser" ADD CONSTRAINT "_AvatarToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Avatar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AvatarToUser" ADD CONSTRAINT "_AvatarToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgencyToAvatar" ADD CONSTRAINT "_AgencyToAvatar_A_fkey" FOREIGN KEY ("A") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgencyToAvatar" ADD CONSTRAINT "_AgencyToAvatar_B_fkey" FOREIGN KEY ("B") REFERENCES "Avatar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
