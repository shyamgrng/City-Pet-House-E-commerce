-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN     "photo" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE';
