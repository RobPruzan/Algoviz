-- CreateTable
CREATE TABLE "Preset" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "circles" JSONB NOT NULL,
    "lines" JSONB NOT NULL,
    "zoomAmount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Preset_pkey" PRIMARY KEY ("id")
);
