-- DropIndex
DROP INDEX "Preset_name_key";

-- AlterTable
ALTER TABLE "Preset" ALTER COLUMN "name" DROP DEFAULT;
