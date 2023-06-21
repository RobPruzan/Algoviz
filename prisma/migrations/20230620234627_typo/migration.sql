/*
  Warnings:

  - You are about to drop the `Algorithim` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Algorithim";

-- CreateTable
CREATE TABLE "Algorithm" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "Algorithm_pkey" PRIMARY KEY ("id")
);
