/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Preset` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Preset" ADD COLUMN     "name" TEXT NOT NULL DEFAULT 'Untitled';

-- CreateIndex
CREATE UNIQUE INDEX "Preset_name_key" ON "Preset"("name");
