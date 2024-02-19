-- DropForeignKey
ALTER TABLE "CrimeCategory" DROP CONSTRAINT "AgencyCrimeCategoryByIdFKey";

-- DropForeignKey
ALTER TABLE "CrimeCategory" DROP CONSTRAINT "AgentCrimeCategoryByIdFKey";

-- DropForeignKey
ALTER TABLE "CrimeCategory" DROP CONSTRAINT "UserCrimeCategoryByIdFKey";

-- AddForeignKey
ALTER TABLE "CrimeCategory" ADD CONSTRAINT "UserCrimeCategoryByIdFKey" FOREIGN KEY ("byId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrimeCategory" ADD CONSTRAINT "AgencyCrimeCategoryByIdFKey" FOREIGN KEY ("byId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrimeCategory" ADD CONSTRAINT "AgentCrimeCategoryByIdFKey" FOREIGN KEY ("byId") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
