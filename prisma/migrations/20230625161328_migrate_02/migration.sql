/*
  Warnings:

  - You are about to drop the column `name` on the `Algorithm` table. All the data in the column will be lost.
  - Added the required column `description` to the `Algorithm` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Algorithm` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Algorithm" DROP COLUMN "name",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Playground" (
    "id" SMALLSERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "circles" JSONB NOT NULL,
    "lines" JSONB NOT NULL,
    "pencil" JSONB NOT NULL,
    "zoomAmount" INTEGER NOT NULL,

    CONSTRAINT "Playground_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Playground" ADD CONSTRAINT "Playground_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
