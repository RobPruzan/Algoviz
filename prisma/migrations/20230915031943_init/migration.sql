/*
  Warnings:

  - A unique constraint covering the columns `[algoID]` on the table `Algorithm` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Algorithm" ADD COLUMN     "algoID" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Algorithm_algoID_key" ON "Algorithm"("algoID");
