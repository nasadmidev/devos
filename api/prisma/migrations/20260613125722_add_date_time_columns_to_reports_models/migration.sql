/*
  Warnings:

  - Added the required column `updatedAt` to the `DoubtReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ResourceReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `UserReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `VisualReport` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DoubtReport" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ResourceReport" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "UserReport" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "VisualReport" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
