-- CreateEnum
CREATE TYPE "ResolutionType" AS ENUM ('ARCHIVED', 'BANNED', 'WAITING');

-- AlterTable
ALTER TABLE "DoubtReport" ADD COLUMN     "resolution" "ResolutionType" NOT NULL DEFAULT 'WAITING';

-- AlterTable
ALTER TABLE "ResourceReport" ADD COLUMN     "resolution" "ResolutionType" NOT NULL DEFAULT 'WAITING';

-- AlterTable
ALTER TABLE "UserReport" ADD COLUMN     "resolution" "ResolutionType" NOT NULL DEFAULT 'WAITING';

-- AlterTable
ALTER TABLE "VisualReport" ADD COLUMN     "resolution" "ResolutionType" NOT NULL DEFAULT 'WAITING';
