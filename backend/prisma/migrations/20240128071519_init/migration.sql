-- CreateEnum
CREATE TYPE "AgencyType" AS ENUM ('GOVERNMENT', 'NONPROFIT');

-- CreateEnum
CREATE TYPE "AgentType" AS ENUM ('NORMAL', 'SUPER');

-- CreateEnum
CREATE TYPE "AdminType" AS ENUM ('ADMIN', 'SUPERADMIN');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'UNDISCLOSED');

-- CreateEnum
CREATE TYPE "Outcome" AS ENUM ('CONVICTION', 'PENDING', 'ACQUITTAL');

-- CreateEnum
CREATE TYPE "SuggestionType" AS ENUM ('APP', 'CRIMECATEGORY', 'CRIMETYPE');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT,
    "username" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "otherNames" TEXT,
    "gender" "Gender" NOT NULL DEFAULT 'UNDISCLOSED',
    "country" TEXT,
    "refreshToken" TEXT,
    "avatarUrl" TEXT,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "AdminType" NOT NULL DEFAULT 'ADMIN',
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agency" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "AgencyType" NOT NULL DEFAULT 'GOVERNMENT',
    "name" TEXT NOT NULL,
    "about" TEXT,
    "userId" INTEGER NOT NULL,
    "verifiedBy" INTEGER NOT NULL,
    "verifiedAt" TIMESTAMP(3),

    CONSTRAINT "Agency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agent" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "AgentType" NOT NULL DEFAULT 'NORMAL',
    "position" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "agencyId" INTEGER NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Crime" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "landmark" TEXT,
    "outcome" "Outcome" NOT NULL DEFAULT 'PENDING',
    "severity" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "lat" DOUBLE PRECISION NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "occurredOn" TIMESTAMP(3),
    "victim" JSONB,
    "suspect" JSONB,

    CONSTRAINT "Crime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgencyToCrime" (
    "agencyId" INTEGER NOT NULL,
    "crimeId" INTEGER NOT NULL,

    CONSTRAINT "AgencyToCrime_pkey" PRIMARY KEY ("agencyId","crimeId")
);

-- CreateTable
CREATE TABLE "AgentToCrime" (
    "agentId" INTEGER NOT NULL,
    "crimeId" INTEGER NOT NULL,

    CONSTRAINT "AgentToCrime_pkey" PRIMARY KEY ("agentId","crimeId")
);

-- CreateTable
CREATE TABLE "Suggestion" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "by" JSONB NOT NULL,
    "type" "SuggestionType" NOT NULL DEFAULT 'APP',
    "message" TEXT NOT NULL,

    CONSTRAINT "Suggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrimeCategory" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "by" JSONB NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CrimeCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrimeType" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "by" JSONB NOT NULL,
    "name" TEXT NOT NULL,
    "crimeCategoryId" INTEGER NOT NULL,

    CONSTRAINT "CrimeType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AgencyToCrime" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AgentToCrime" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_userId_key" ON "Admin"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "_AgencyToCrime_AB_unique" ON "_AgencyToCrime"("A", "B");

-- CreateIndex
CREATE INDEX "_AgencyToCrime_B_index" ON "_AgencyToCrime"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AgentToCrime_AB_unique" ON "_AgentToCrime"("A", "B");

-- CreateIndex
CREATE INDEX "_AgentToCrime_B_index" ON "_AgentToCrime"("B");

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agency" ADD CONSTRAINT "Agency_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agency" ADD CONSTRAINT "Agency_verifiedBy_fkey" FOREIGN KEY ("verifiedBy") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgencyToCrime" ADD CONSTRAINT "AgencyToCrime_crimeId_fkey" FOREIGN KEY ("crimeId") REFERENCES "Crime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgencyToCrime" ADD CONSTRAINT "AgencyToCrime_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentToCrime" ADD CONSTRAINT "AgentToCrime_crimeId_fkey" FOREIGN KEY ("crimeId") REFERENCES "Crime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentToCrime" ADD CONSTRAINT "AgentToCrime_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrimeType" ADD CONSTRAINT "CrimeType_crimeCategoryId_fkey" FOREIGN KEY ("crimeCategoryId") REFERENCES "CrimeCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgencyToCrime" ADD CONSTRAINT "_AgencyToCrime_A_fkey" FOREIGN KEY ("A") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgencyToCrime" ADD CONSTRAINT "_AgencyToCrime_B_fkey" FOREIGN KEY ("B") REFERENCES "Crime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgentToCrime" ADD CONSTRAINT "_AgentToCrime_A_fkey" FOREIGN KEY ("A") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgentToCrime" ADD CONSTRAINT "_AgentToCrime_B_fkey" FOREIGN KEY ("B") REFERENCES "Crime"("id") ON DELETE CASCADE ON UPDATE CASCADE;
