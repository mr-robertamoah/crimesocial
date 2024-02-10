-- CreateTable
CREATE TABLE "DescriptiveMarkers" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "DescriptiveMarkers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DescriptiveMarkers" ADD CONSTRAINT "DescriptiveMarkers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
