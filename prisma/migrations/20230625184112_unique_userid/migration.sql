/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Playground` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Playground_userId_key" ON "Playground"("userId");
