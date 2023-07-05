-- DropIndex
DROP INDEX "Playground_userId_key";

-- AlterTable
ALTER TABLE "Algorithm" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'visualizer';
