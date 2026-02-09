-- CreateEnum
CREATE TYPE "MaintenancePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- DropForeignKey
ALTER TABLE "room_maintenances" DROP CONSTRAINT "room_maintenances_roomId_fkey";

-- AlterTable
ALTER TABLE "room_maintenances" ADD COLUMN     "assignedTo" TEXT,
ADD COLUMN     "priority" "MaintenancePriority" NOT NULL DEFAULT 'MEDIUM';

-- CreateIndex
CREATE INDEX "room_maintenances_status_idx" ON "room_maintenances"("status");

-- AddForeignKey
ALTER TABLE "room_maintenances" ADD CONSTRAINT "room_maintenances_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
