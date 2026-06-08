/*
  Warnings:

  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[oauthId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('NOT_TECH_RELATED', 'SPAM', 'PLAGIARISM', 'MALICIOUS_CODE', 'TOXIC_BEHAVIOR', 'OTHER');

-- DropIndex
DROP INDEX "User_username_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "username",
ADD COLUMN     "oauthId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'USER';

-- CreateTable
CREATE TABLE "Visual" (
    "id" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Visual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Doubt" (
    "id" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "code" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Doubt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisualLike" (
    "id" SERIAL NOT NULL,
    "userId" UUID NOT NULL,
    "visualId" UUID NOT NULL,

    CONSTRAINT "VisualLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceLike" (
    "id" SERIAL NOT NULL,
    "userId" UUID NOT NULL,
    "resourceId" UUID NOT NULL,

    CONSTRAINT "ResourceLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisualComment" (
    "id" UUID NOT NULL,
    "parentId" UUID,
    "visualId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisualComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceComment" (
    "id" UUID NOT NULL,
    "parentId" UUID,
    "resourceId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResourceComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisualBookmark" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "visualId" UUID NOT NULL,

    CONSTRAINT "VisualBookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceBookmark" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "resourceId" UUID NOT NULL,

    CONSTRAINT "ResourceBookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "doubtId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "code" TEXT,
    "correct" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnswerComment" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "answerId" UUID NOT NULL,
    "parentId" UUID,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnswerComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserReport" (
    "id" UUID NOT NULL,
    "fromUserId" UUID NOT NULL,
    "toUserId" UUID NOT NULL,
    "type" "ReportType" NOT NULL DEFAULT 'OTHER',
    "reason" TEXT NOT NULL,

    CONSTRAINT "UserReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisualReport" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "visualId" UUID NOT NULL,
    "type" "ReportType" NOT NULL DEFAULT 'OTHER',
    "reason" TEXT NOT NULL,

    CONSTRAINT "VisualReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceReport" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "resourceId" UUID NOT NULL,
    "type" "ReportType" NOT NULL DEFAULT 'OTHER',
    "reason" TEXT NOT NULL,

    CONSTRAINT "ResourceReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoubtReport" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "doubtId" UUID NOT NULL,
    "type" "ReportType" NOT NULL DEFAULT 'OTHER',
    "reason" TEXT NOT NULL,

    CONSTRAINT "DoubtReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VisualLike_userId_visualId_key" ON "VisualLike"("userId", "visualId");

-- CreateIndex
CREATE UNIQUE INDEX "ResourceLike_userId_resourceId_key" ON "ResourceLike"("userId", "resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "VisualBookmark_userId_visualId_key" ON "VisualBookmark"("userId", "visualId");

-- CreateIndex
CREATE UNIQUE INDEX "ResourceBookmark_userId_resourceId_key" ON "ResourceBookmark"("userId", "resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "UserReport_toUserId_fromUserId_key" ON "UserReport"("toUserId", "fromUserId");

-- CreateIndex
CREATE UNIQUE INDEX "VisualReport_visualId_userId_key" ON "VisualReport"("visualId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ResourceReport_resourceId_userId_key" ON "ResourceReport"("resourceId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "DoubtReport_doubtId_userId_key" ON "DoubtReport"("doubtId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_oauthId_key" ON "User"("oauthId");

-- AddForeignKey
ALTER TABLE "Visual" ADD CONSTRAINT "Visual_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doubt" ADD CONSTRAINT "Doubt_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisualLike" ADD CONSTRAINT "VisualLike_visualId_fkey" FOREIGN KEY ("visualId") REFERENCES "Visual"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisualLike" ADD CONSTRAINT "VisualLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceLike" ADD CONSTRAINT "ResourceLike_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceLike" ADD CONSTRAINT "ResourceLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisualComment" ADD CONSTRAINT "VisualComment_visualId_fkey" FOREIGN KEY ("visualId") REFERENCES "Visual"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisualComment" ADD CONSTRAINT "VisualComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisualComment" ADD CONSTRAINT "VisualComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "VisualComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceComment" ADD CONSTRAINT "ResourceComment_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceComment" ADD CONSTRAINT "ResourceComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceComment" ADD CONSTRAINT "ResourceComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ResourceComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisualBookmark" ADD CONSTRAINT "VisualBookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisualBookmark" ADD CONSTRAINT "VisualBookmark_visualId_fkey" FOREIGN KEY ("visualId") REFERENCES "Visual"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceBookmark" ADD CONSTRAINT "ResourceBookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceBookmark" ADD CONSTRAINT "ResourceBookmark_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_doubtId_fkey" FOREIGN KEY ("doubtId") REFERENCES "Doubt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerComment" ADD CONSTRAINT "AnswerComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerComment" ADD CONSTRAINT "AnswerComment_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "Answer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerComment" ADD CONSTRAINT "AnswerComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "AnswerComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserReport" ADD CONSTRAINT "UserReport_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserReport" ADD CONSTRAINT "UserReport_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisualReport" ADD CONSTRAINT "VisualReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisualReport" ADD CONSTRAINT "VisualReport_visualId_fkey" FOREIGN KEY ("visualId") REFERENCES "Visual"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceReport" ADD CONSTRAINT "ResourceReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceReport" ADD CONSTRAINT "ResourceReport_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoubtReport" ADD CONSTRAINT "DoubtReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoubtReport" ADD CONSTRAINT "DoubtReport_doubtId_fkey" FOREIGN KEY ("doubtId") REFERENCES "Doubt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
